from style import *
import numpy as np
rng=np.random.default_rng(7)
# 1. multicollinearity: coefficients across resamples
n=40; exp=rng.uniform(1,10,n); months=12*exp+rng.normal(0,0.6,n); proj=rng.uniform(0,10,n)
y=20+4*exp+1.0*proj+rng.normal(0,2,n)
fig,ax=plt.subplots(1,2,figsize=(9,3.4),sharey=False)
for k in range(8):
    i=rng.integers(0,n,n)
    A=np.c_[np.ones(n),exp,months][i]; b=np.linalg.lstsq(A,y[i],rcond=None)[0]
    ax[0].plot([0,1],[b[1],b[2]*12],marker="o",color=ROSE,alpha=.7)
    A2=np.c_[np.ones(n),exp,proj][i]; b2=np.linalg.lstsq(A2,y[i],rcond=None)[0]
    ax[1].plot([0,1],[b2[1],b2[2]],marker="o",color=TEAL,alpha=.7)
for a,t,l in [(ax[0],"Near-duplicate features\n(experience and months worked)",["experience","months (per-year scale)"]),(ax[1],"Distinct features\n(experience, projects)",["experience","projects"])]:
    a.set_xticks([0,1]); a.set_xticklabels(l); a.set_title(t); a.set_xlim(-.3,1.3); a.axhline(0,color=LIGHT,lw=.8)
ax[0].set_ylabel("fitted coefficient (8 resamples)")
save(fig,"mlr_multicollinearity")
# 2. metrics: one outlier
err=np.array([-10,10,-20,20,20.]); err2=err.copy(); err2[-1]=120
fig,ax=plt.subplots(figsize=(6.4,3.3))
lab=["MAE","RMSE"]; v1=[abs(err).mean(),np.sqrt((err**2).mean())]; v2=[abs(err2).mean(),np.sqrt((err2**2).mean())]
xx=np.arange(2); ax.bar(xx-.18,v1,.34,color=TEAL,label="original errors"); ax.bar(xx+.18,v2,.34,color=AMBER,label="one miss becomes 120")
for i in range(2): ax.text(xx[i]-.18,v1[i]+2,f"{v1[i]:.1f}",ha="center"); ax.text(xx[i]+.18,v2[i]+2,f"{v2[i]:.1f}",ha="center")
ax.set_xticks(xx); ax.set_xticklabels(lab); ax.set_ylabel("error ($k)"); ax.legend(frameon=False); ax.set_title("One large miss moves RMSE far more than MAE")
save(fig,"reg_metrics_outlier")
# 3. residual patterns
fig,ax=plt.subplots(1,3,figsize=(10.5,3.2),sharey=True)
f=np.linspace(0,10,120)
pats=[("Healthy: random band",rng.normal(0,1,120)),("Curve: a missing x² term",0.25*(f-5)**2-2+rng.normal(0,.6,120)),("Fan: spread grows",rng.normal(0,1,120)*(0.2+0.3*f))]
for a,(t,r) in zip(ax,pats):
    a.scatter(f,r,s=10,color=TEAL,alpha=.7); a.axhline(0,color=ROSE,lw=1); a.set_title(t); a.set_xlabel("predicted value")
ax[0].set_ylabel("residual (actual − predicted)")
save(fig,"reg_residual_patterns")
# 4. tree vs knn regression
x=np.array([1,2,3,4,5,6.]); t=np.array([5,6,5,12,13,14.])
fig,ax=plt.subplots(1,2,figsize=(9.5,3.4),sharey=True)
xs=np.linspace(.5,6.5,400)
ax[0].scatter(x,t,color=SLATE,zorder=3); ax[0].plot(xs,np.where(xs<3.5,16/3,13),color=TEAL,lw=2.5,label="depth-1 tree (split at 3.5)")
ax[0].axvline(3.5,color=LIGHT,ls="--"); ax[0].set_title("Regression tree: one constant per leaf"); ax[0].legend(frameon=False,loc="upper left")
for k,c in [(1,AMBER),(3,VIOLET)]:
    pred=[t[np.argsort(abs(x-v),kind="stable")[:k]].mean() for v in xs]; ax[1].plot(xs,pred,color=c,lw=2,label=f"KNN, k={k}")
ax[1].scatter(x,t,color=SLATE,zorder=3); ax[1].set_title("KNN regression: average of neighbours"); ax[1].legend(frameon=False,loc="upper left")
for a in ax: a.set_xlabel("x")
ax[0].set_ylabel("y")
save(fig,"reg_tree_knn")
