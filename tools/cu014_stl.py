#!/usr/bin/env python3
"""Verifica le misure di cu014-solido.json sull'STL di riferimento (riferimenti/cu014-vettoriale.stl).

Uso: python3 -I tools/cu014_stl.py [percorso.stl]   (-I: la cartella tools ha un inspect.py che oscura quello della libreria standard)

L'STL è una mesh a scala arbitraria (1 unità ≈ 86,2 m, z in alto). La trasformazione in metri nelle coordinate del
lato 0 di CU014 (u, v) è in cu014-solido.json -> "stl"; è stata trovata cercando scala, rotazione e traslazione che
sovrappongono i muri verticali dell'STL ai lati della sagoma OSM (correlazione 2D, poi affinamento a passo fine).
Lo script applica la trasformazione, toglie il piano del terreno e, per ogni ala e fondo del JSON, stampa la quota
misurata (80° percentile delle facce rivolte in su dentro il rettangolo) accanto a quella scritta nel file.
"""
import json, math, os, struct, sys
import numpy as np

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)


def leggi_stl(percorso):
    dati = open(percorso, 'rb').read()
    n = struct.unpack('<I', dati[80:84])[0]
    if 84 + 50 * n == len(dati):  # binario
        tipo = np.dtype([('n', '<f4', 3), ('v', '<f4', (3, 3)), ('a', '<u2')])
        return np.frombuffer(dati, dtype=tipo, offset=84, count=n)['v'].astype(float)
    righe = dati.decode('ascii', 'ignore').split('vertex')[1:]  # ASCII
    return np.array([[float(x) for x in r.split()[:3]] for r in righe]).reshape(-1, 3, 3)


def in_metri(tri, stl):
    th = math.radians(stl['rotazioneDeg'])
    c, s = math.cos(-th), math.sin(-th)
    q = tri[..., :2] - stl['traslazione']
    uv = np.stack([c * q[..., 0] - s * q[..., 1], s * q[..., 0] + c * q[..., 1]], -1) * stl['scalaMetriPerUnita'] + stl['centroSagoma']
    a, b, d = stl['pianoTerreno']
    return uv, tri[..., 2] * stl['scalaMetriPerUnita'] - (a + b * uv[..., 0] + d * uv[..., 1])


def main():
    tri = leggi_stl(sys.argv[1] if len(sys.argv) > 1 else os.path.join(RADICE, 'riferimenti', 'cu014-vettoriale.stl'))
    dati = json.load(open(os.path.join(RADICE, 'cu014-solido.json')))
    uv, h = in_metri(tri, dati['stl'])
    cu, ch = uv.mean(1), h.mean(1)
    nrm = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    su = nrm[:, 2] / np.linalg.norm(nrm, axis=1).clip(1e-12) > 0.8  # facce rivolte in su
    area = np.linalg.norm(nrm, axis=1) / 2

    def misura(rect, lo, hi, perc):
        u0, v0, u1, v1 = rect
        m = su & (cu[:, 0] > u0) & (cu[:, 0] < u1) & (cu[:, 1] > v0) & (cu[:, 1] < v1) & (ch > lo) & (ch < hi)
        if m.sum() < 5:
            return None
        o = np.argsort(ch[m]); w = np.cumsum(area[m][o]) / area[m].sum()
        return float(ch[m][o][np.searchsorted(w, perc)])

    print('ali (tetti, quote > 8 m)       scritta  misurata')
    for ala in dati['ali']:
        print(f"  {ala['id']:<26}{ala['altezza']:7.1f}  {misura(ala['rect'], 8, 30, 0.8)}")
    print('fondi dei cortili               scritta  misurata (mediana)')
    for f in dati.get('fondi', []):
        print(f"  {f['id']:<26}{f['quota']:7.1f}  {misura(f['rect'], 3, 8, 0.5)}")


if __name__ == '__main__':
    main()
