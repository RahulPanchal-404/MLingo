"""Shared style for the theory graphs. Run any *_figs.py in this folder to regenerate public/theory/figures/*.svg."""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
TEAL="#0f766e"; AMBER="#d97706"; ROSE="#e11d48"; SLATE="#334155"; LIGHT="#94a3b8"; VIOLET="#7c3aed"
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "theory", "figures")
os.makedirs(OUT, exist_ok=True)
plt.rcParams.update({"font.family":"DejaVu Sans","font.size":11,"axes.spines.top":False,"axes.spines.right":False,
  "axes.edgecolor":SLATE,"axes.labelcolor":SLATE,"xtick.color":SLATE,"ytick.color":SLATE,"axes.titleweight":"bold",
  "axes.titlesize":12,"svg.fonttype":"none","figure.dpi":110})
def save(fig, name):
    fig.tight_layout(); fig.savefig(f"{OUT}/{name}.svg", format="svg", metadata={"Date":None}); plt.close(fig)
