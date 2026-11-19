"""Graphs for the Regression/Classification lesson walkthroughs (textbook examples)."""
from style import *
import numpy as np
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.pipeline import make_pipeline
# 1 linear fit with residuals (compressor data)
x=np.array([1,2,3.]); y=np.array([2,3,5.]); b1,b0=1.5,1/3
fig,ax=plt.subplots(figsize=(5.6,3.8)); xs=np.linspace(0.5,3.5,10); ax.plot(xs,b0+b1*xs,color=TEAL,lw=2.4,label="ŷ = 1/3 + 1.5x")
for xi,yi in zip(x,y): ax.plot([xi,xi],[yi,b0+b1*xi],color=ROSE,lw=2)
ax.scatter(x,y,color=SLATE,zorder=4,s=50,label="data"); ax.set_xlabel("compressor cycles x"); ax.set_ylabel("energy y"); ax.legend(frameon=False); ax.set_title("Least squares: residuals 1/6, −1/3, 1/6")
save(fig,"m_linear_fit")
# 2 polynomial degrees
rng=np.random.default_rng(0); f=lambda x:1+0.6*x-0.3*x**2
xt=np.sort(rng.uniform(-2,2,15)); yt=f(xt)+rng.normal(0,0.3,15); xs=np.linspace(-2.2,3,300)
fig,ax=plt.subplots(figsize=(6.6,3.8)); ax.scatter(xt,yt,color=SLATE,zorder=4,label="training data")
for d,c in [(1,AMBER),(2,TEAL),(9,ROSE)]:
    m=make_pipeline(PolynomialFeatures(d),LinearRegression()).fit(xt[:,None],yt); ax.plot(xs,m.predict(xs[:,None]),color=c,lw=2,label=f"degree {d}")
ax.axvspan(2,3,color=LIGHT,alpha=.25); ax.text(2.05,1.7,"outside\nthe data",fontsize=9,color=SLATE); ax.set_ylim(-3,2.2); ax.legend(frameon=False,loc="lower center",ncol=2); ax.set_xlabel("x"); ax.set_ylabel("y"); ax.set_title("Degree 2 fits; degree 9 chases noise and explodes outside")
save(fig,"m_poly_degrees")
# 3 ridge vs lasso paths
rng=np.random.default_rng(1); n=60; X=rng.normal(size=(n,5)); X[:,1]=X[:,0]+rng.normal(0,.2,n); yy=3*X[:,0]+1.5*X[:,2]-1*X[:,3]+rng.normal(0,1,n)
lams=np.logspace(-2,2,40); R=np.array([Ridge(alpha=a*n).fit(X,yy).coef_ for a in lams]); L=np.array([Lasso(alpha=a/4,max_iter=20000).fit(X,yy).coef_ for a in lams])
fig,ax=plt.subplots(1,2,figsize=(10,3.5),sharey=True); cols=[TEAL,AMBER,VIOLET,ROSE,SLATE]
for j in range(5): ax[0].plot(lams,R[:,j],color=cols[j],lw=2,label=f"x{j+1}"); ax[1].plot(lams,L[:,j],color=cols[j],lw=2)
for a,t in zip(ax,["Ridge: shrinks smoothly, never exactly 0","Lasso: coefficients hit exactly 0"]): a.set_xscale("log"); a.axhline(0,color=LIGHT,lw=.8); a.set_xlabel("penalty strength λ"); a.set_title(t)
ax[0].set_ylabel("coefficient"); ax[0].legend(frameon=False,ncol=2,fontsize=9)
save(fig,"m_ridge_lasso")
# 4 sigmoid & odds doubling
z=np.linspace(-6,6,300); s=1/(1+np.exp(-z))
fig,ax=plt.subplots(figsize=(6.2,3.6)); ax.plot(z,s,color=TEAL,lw=2.4)
for p0,c in [(0.1,AMBER),(0.5,VIOLET)]:
    z0=np.log(p0/(1-p0)); z1=z0+np.log(2); p1=1/(1+np.exp(-z1)); ax.annotate("",(z1,p1),(z0,p0),arrowprops=dict(arrowstyle="->",color=c,lw=2)); ax.text(z1+0.2,p1-0.06,f"{p0} → {p1:.3f}",color=c)
ax.axhline(.5,ls=":",color=LIGHT); ax.set_xlabel("score z = b + wᵀx (log-odds)"); ax.set_ylabel("p = σ(z)"); ax.set_title("Adding log 2 to z doubles the odds, not the probability")
save(fig,"m_sigmoid_odds")
# 5 knn pumps
P={"A":(0,0),"B":(0,2),"C":(2,0),"D":(6,6),"E":(6,8),"F":(8,6)}; lab={"A":0,"B":0,"C":0,"D":1,"E":1,"F":1}
fig,ax=plt.subplots(figsize=(5.4,4.4))
for k,(px,py) in P.items(): ax.scatter(px,py,s=120,color=TEAL if lab[k]==0 else ROSE,zorder=3); ax.text(px+.25,py+.25,k,fontsize=11)
for q,c in [((3,4),AMBER),((5,6),VIOLET)]:
    ax.scatter(*q,marker="*",s=260,color=c,zorder=4); ax.text(q[0]+.3,q[1]-.6,f"Q{q}",color=c)
ax.add_patch(plt.Circle((3,4),np.sqrt(17),fill=False,ls="--",color=AMBER)); ax.set_aspect("equal"); ax.set_xlim(-1.5,10); ax.set_ylim(-1.5,10)
ax.scatter([],[],color=TEAL,label="no defect (0)"); ax.scatter([],[],color=ROSE,label="defect (1)"); ax.legend(frameon=False,loc="upper left"); ax.set_title("k = 3: the circle around Q(3,4) holds B, D, C")
save(fig,"m_knn_pumps")
# 6 tree split comparison
fig,ax=plt.subplots(figsize=(6.2,3.4)); names=["parent","split A\n(5 | 5)","split B\n(2 | 8)"]; g=[0.48,0.40,0.30]; e=[0.971,0.846,0.649]; xx=np.arange(3)
ax.bar(xx-.18,g,.34,color=TEAL,label="weighted Gini"); ax.bar(xx+.18,e,.34,color=VIOLET,label="weighted entropy (bits)")
for i in range(3): ax.text(xx[i]-.18,g[i]+.02,f"{g[i]:.2f}",ha="center",fontsize=9); ax.text(xx[i]+.18,e[i]+.02,f"{e[i]:.3f}",ha="center",fontsize=9)
ax.set_xticks(xx); ax.set_xticklabels(names); ax.set_ylabel("impurity (lower is purer)"); ax.legend(frameon=False); ax.set_title("Split B leaves less impurity, so the tree picks it")
save(fig,"m_tree_splits")
