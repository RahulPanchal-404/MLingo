from style import *
import numpy as np
from scipy import stats
rng=np.random.default_rng(4)
# LA: unit circle -> ellipse
A=np.array([[2,1],[1,2.]]); th=np.linspace(0,2*np.pi,200); C=np.c_[np.cos(th),np.sin(th)].T; E=A@C
fig,ax=plt.subplots(1,2,figsize=(8.6,4.2))
for a,P,t in [(ax[0],C,"Before: unit circle"),(ax[1],E,"After multiplying by A")]:
    a.plot(P[0],P[1],color=TEAL,lw=2); a.set_aspect("equal"); a.set_xlim(-3.4,3.4); a.set_ylim(-3.4,3.4); a.axhline(0,color=LIGHT,lw=.6); a.axvline(0,color=LIGHT,lw=.6); a.set_title(t)
v1=np.array([1,1])/np.sqrt(2); v2=np.array([1,-1])/np.sqrt(2)
ax[0].annotate("",v1,(0,0),arrowprops=dict(arrowstyle="->",color=AMBER,lw=2)); ax[0].annotate("",v2,(0,0),arrowprops=dict(arrowstyle="->",color=VIOLET,lw=2))
ax[1].annotate("",3*v1,(0,0),arrowprops=dict(arrowstyle="->",color=AMBER,lw=2)); ax[1].annotate("",1*v2,(0,0),arrowprops=dict(arrowstyle="->",color=VIOLET,lw=2))
ax[1].text(2.2,2.5,"eigenvector (1,1)\nstretched ×3",color=AMBER,fontsize=9); ax[1].text(.6,-1.4,"eigenvector (1,−1)\nstretched ×1",color=VIOLET,fontsize=9)
save(fig,"basics_eigen")
# Stats: 25 confidence intervals
fig,ax=plt.subplots(figsize=(6.8,4.0)); mu=50; miss=0
for i in range(25):
    s=rng.normal(mu,10,15); m=s.mean(); h=stats.t.ppf(.975,14)*s.std(ddof=1)/np.sqrt(15); ok=(m-h<=mu<=m+h); miss+=not ok
    ax.plot([m-h,m+h],[i,i],color=TEAL if ok else ROSE,lw=2.2); ax.plot(m,i,"o",color=TEAL if ok else ROSE,ms=4)
ax.axvline(mu,color=SLATE,ls="--"); ax.set_yticks([]); ax.set_xlabel("value"); ax.set_title(f"25 samples, 25 different 95% intervals ({miss} miss the true mean)")
save(fig,"basics_ci_coverage")
# GD: loss curves + scaled/unscaled paths
n=1000; x=rng.uniform(0,10,n); y=4+3*x+rng.normal(0,2,n); X=np.c_[np.ones(n),(x-x.mean())/x.std()]
def run(bs,lr,steps=200):
    w=np.zeros(2); L=[]
    for k in range(steps):
        b=rng.choice(n,bs,replace=False) if bs<n else np.arange(n)
        w-=lr*2/len(b)*X[b].T@(X[b]@w-y[b]); L.append(np.mean((X@w-y)**2))
    return L
fig,ax=plt.subplots(1,2,figsize=(10,3.6))
for bs,lr,c,l in [(n,.1,SLATE,"batch"),(32,.1,TEAL,"mini-batch 32"),(1,.01,ROSE,"stochastic (1 row)")]:
    ax[0].plot(run(bs,lr),color=c,label=l,lw=3.2 if bs==n else 1.6,ls="--" if bs==n else "-",zorder=3 if bs==n else 2)
ax[0].set_yscale("log"); ax[0].set_xlabel("update number"); ax[0].set_ylabel("training MSE (log scale)"); ax[0].legend(frameon=False); ax[0].set_title("Same number of updates, different noise")
# contours unscaled vs scaled for quadratic f = a w1^2 + b w2^2
for a_,b_,c,l,lr in [(1,25,ROSE,"unscaled (curvatures 1 vs 25)",0.038),(1,1,TEAL,"scaled (equal curvature)",0.4)]:
    w=np.array([-4.,2.5]); P=[w.copy()]
    for _ in range(25): w=w-lr*np.array([2*a_*w[0],2*b_*w[1]]); P.append(w.copy())
    P=np.array(P); ax[1].plot(P[:,0],P[:,1],marker="o",ms=3,color=c,label=l)
g1,g2=np.meshgrid(np.linspace(-4.5,1,100),np.linspace(-3,3,100)); ax[1].contour(g1,g2,g1**2+25*g2**2,levels=12,colors=LIGHT,linewidths=.6)
ax[1].set_title("Unscaled features make GD zig-zag"); ax[1].legend(frameon=False,loc="lower right",fontsize=9); ax[1].set_xlabel("w₁"); ax[1].set_ylabel("w₂")
save(fig,"basics_gd_variants")
# LR stability on f=w^2 (curvature 2): limit eta<2/2=1
fig,ax=plt.subplots(figsize=(6.4,3.4))
for eta,c in [(0.3,TEAL),(0.9,AMBER),(1.05,ROSE)]:
    w=1.0; W=[w]
    for _ in range(15): w=w-eta*2*w; W.append(w)
    ax.plot(W,marker="o",ms=3,color=c,label=f"η = {eta}")
ax.axhline(0,color=LIGHT); ax.set_xlabel("step"); ax.set_ylabel("w"); ax.set_title("f(w) = w², curvature L = 2, so η must be below 2/L = 1"); ax.legend(frameon=False)
save(fig,"basics_lr_limit")
