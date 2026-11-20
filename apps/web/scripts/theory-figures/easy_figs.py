"""Figures for the easy layer (worked examples)."""
import numpy as np
from matplotlib.patches import Polygon
from style import plt, save, TEAL, AMBER, ROSE, SLATE, LIGHT

def panel(ax, M, title, color):
    sq = np.array([[0,0],[1,0],[1,1],[0,1]])
    ax.add_patch(Polygon(sq, closed=True, fc=LIGHT, alpha=.25, ec=LIGHT, lw=1.5, ls="--"))
    img = sq @ M.T
    ax.add_patch(Polygon(img, closed=True, fc=color, alpha=.25, ec=color, lw=2))
    for v, lab in ((M[:,0], "column 1"), (M[:,1], "column 2")):
        ax.annotate("", xy=v, xytext=(0,0), arrowprops=dict(arrowstyle="-|>", color=color, lw=2))
        ax.text(v[0]+.08, v[1]+.08, f"{lab}\n({v[0]:g}, {v[1]:g})", fontsize=9, color=SLATE)
    ax.set_title(title); ax.set_aspect("equal"); ax.set_xlim(-.3, 5.4); ax.set_ylim(-.3, 2.8); ax.grid(alpha=.2)

fig, axes = plt.subplots(1, 2, figsize=(9, 3.6))
panel(axes[0], np.array([[3,1],[0,2]]), "A = [[3, 1], [0, 2]]:  det = 6", TEAL)
axes[0].text(2.1, .9, "area 6", color=TEAL, fontweight="bold")
axes[0].text(.12, .45, "area 1", color=SLATE, fontsize=9)
panel(axes[1], np.array([[2,4],[1,2]]), "B = [[2, 4], [1, 2]]:  det = 0", ROSE)
axes[1].text(2.4, .6, "flattened onto a line:\narea 0, no inverse", color=ROSE, fontsize=9)
save(fig, "easy_determinant")
