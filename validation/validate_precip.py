import requests, pandas as pd, numpy as np
from scipy import stats
import pymannkendall as mk

LON, LAT = 15.625, 78.0

def load_giovanni(path):
    lines = open(path, encoding="utf-8").read().splitlines()
    start = next(i for i, l in enumerate(lines) if l.lower().startswith("time"))
    df = pd.read_csv(path, skiprows=start)
    df.columns = ["time", "v"]
    df["time"] = pd.to_datetime(df["time"])
    v = df.set_index("time")["v"].astype(float)
    return v.where((v > -9990) & (v < 1e14))          # mask both fill values

def power_monthly(param, y0, y1):
    r = requests.get("https://power.larc.nasa.gov/api/temporal/monthly/point",
        params=dict(parameters=param, community="AG", longitude=LON,
                    latitude=LAT, start=y0, end=y1, format="JSON"), timeout=60)
    r.raise_for_status()
    d = r.json()["properties"]["parameter"][param]
    s = pd.Series({k: v for k, v in d.items() if not k.endswith("13")}, dtype=float)
    s.index = pd.to_datetime(s.index, format="%Y%m")
    return s.where(s > -990)

def anomalies(s):
    return s - s.groupby(s.index.month).transform("mean")

def trend(a):
    a = a.dropna()
    t = a.index.year + (a.index.month - 1) / 12
    sl, _, lo, hi = stats.theilslopes(a.values, t)
    p = mk.hamed_rao_modification_test(a.values).p
    return sl * 10, lo * 10, hi * 10, p            # per decade

imerg = load_giovanni("data/precipitation_gpm_monthly.csv") * 24   # mm/day
power = power_monthly("PRECTOTCORR", 2000, 2024)
df = pd.concat({"imerg": imerg, "power": power}, axis=1).dropna()
df = df["2000-06":"2024-12"]

print("monthly r (raw):      %.2f" % df.imerg.corr(df.power))
print("monthly r (anomaly):  %.2f" % anomalies(df.imerg).corr(anomalies(df.power)))
print("mean mm/day  IMERG %.3f | POWER %.3f" % (df.imerg.mean(), df.power.mean()))
for k in ("imerg", "power"):
    s, lo, hi, p = trend(anomalies(df[k]))
    print(f"{k}: {s:+.4f} mm/day/decade (95% CI {lo:+.4f} to {hi:+.4f}), p={p:.3f}")