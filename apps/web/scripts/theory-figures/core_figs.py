from style import *
import numpy as np
# 1. loss shapes
e=np.linspace(-4,4,400)
fig,ax=plt.subplots(1,2,figsize=(10,3.6))
ax[0].plot(e,e**2,color=ROSE,lw=2.2,label="MSE: e²"); ax[0].plot(e,abs(e),color=TEAL,lw=2.2,label="MAE: |e|")
d=1; ax[0].plot(e,np.where(abs(e)<=d,.5*e**2,d*(abs(e)-.5*d)),color=AMBER,lw=2.2,ls="--",label="Huber (δ=1)")
ax[0].set_ylim(0,8); ax[0].set_xlabel("error e = y − ŷ"); ax[0].set_ylabel("loss"); ax[0].legend(frameon=False); ax[0].set_title("Regression losses: how misses are charged")
p=np.linspace(0.005,0.995,400); ax[1].plot(p,-np.log(p),color=VIOLET,lw=2.2,label="true label 1: −ln p"); ax[1].plot(p,-np.log(1-p),color=SLATE,lw=2.2,ls="--",label="true label 0: −ln(1−p)")
ax[1].set_ylim(0,5); ax[1].set_xlabel("predicted probability p of class 1"); ax[1].set_ylabel("log loss"); ax[1].legend(frameon=False); ax[1].set_title("Log loss explodes for confident mistakes")
save(fig,"core_losses")
# 2. training loop on the textbook's streetlight rows (0,1),(1,3),(2,5), half-MSE, lr 0.1
x=np.array([0,1,2.]); y=np.array([1,3,5.]); w=b=0.; L=[]; snaps={}
for ep in range(1,101):
    err=w*x+b-y; L.append(np.mean(err**2)/2); gw,gb=np.mean(err*x),np.mean(err); w-=.1*gw; b-=.1*gb
    if ep in (1,10,100): snaps[ep]=(w,b)
fig,ax=plt.subplots(1,2,figsize=(10,3.5))
ax[0].plot(range(1,101),L,color=TEAL,lw=2.2); ax[0].set_yscale("log"); ax[0].set_xlabel("update"); ax[0].set_ylabel("J (log scale)"); ax[0].set_title("Loss falls as the model learns")
xs=np.linspace(-0.3,2.5,10); ax[1].scatter(x,y,color=SLATE,zorder=4,label="data")
for ep,c in [(1,LIGHT),(10,AMBER),(100,TEAL)]:
    ww,bb=snaps[ep]; ax[1].plot(xs,ww*xs+bb,color=c,lw=2,label=f"after update {ep}: ŷ={ww:.2f}x+{bb:.2f}")
ax[1].legend(frameon=False,fontsize=9); ax[1].set_xlabel("scheduled hours x"); ax[1].set_ylabel("energy y"); ax[1].set_title("The line moves toward the data")
save(fig,"core_training_loop")
# 3. GD path on the same objective
W,B=np.meshgrid(np.linspace(-0.4,2.8,220),np.linspace(-0.6,2.2,220))
Lg=((W[...,None]*x+B[...,None]-y)**2).mean(-1)/2
w=b=0.; P=[(w,b)]
for _ in range(60):
    err=w*x+b-y; w,b=w-.1*np.mean(err*x), b-.1*np.mean(err); P.append((w,b))
P=np.array(P)
fig,ax=plt.subplots(figsize=(6,4.4)); cs=ax.contour(W,B,Lg,levels=[0.02,0.1,0.3,0.7,1.5,3,5],colors=LIGHT,linewidths=.8); ax.clabel(cs,fontsize=7)
ax.plot(P[:,0],P[:,1],marker="o",ms=2.5,color=ROSE,lw=1.4); ax.scatter([2],[1],marker="*",s=180,color=TEAL,zorder=5)
ax.annotate("start (0, 0)",(0,0),(0.3,-0.45),arrowprops=dict(arrowstyle="->",color=SLATE)); ax.annotate("minimum (2, 1)",(2,1),(2.1,1.8),arrowprops=dict(arrowstyle="->",color=TEAL),color=TEAL)
ax.set_xlabel("slope w"); ax.set_ylabel("intercept b"); ax.set_title("Gradient descent walks downhill on J(w, b)")
save(fig,"core_gd_path")
# 4. learning rate: the textbook's stable (0.8/L) vs unstable (2.1/L) runs, plus schedules
rng=np.random.default_rng(62); xt=np.linspace(-2,2,30); yt=1+0.6*xt-0.3*xt**2+rng.normal(0,0.12,30)
raw=np.column_stack((xt,xt**2)); D=np.column_stack((np.ones(30),(raw-raw.mean(0))/raw.std(0))); Lmax=np.linalg.eigvalsh(D.T@D/30)[-1]
def hist(rate,steps):
    th=np.zeros(3); h=[np.mean((D@th-yt)**2)/2]
    for _ in range(steps): th-=rate*D.T@(D@th-yt)/30; h.append(np.mean((D@th-yt)**2)/2)
    return h
fig,ax=plt.subplots(1,2,figsize=(10,3.5))
ax[0].plot(hist(0.8/Lmax,30),color=TEAL,lw=2,marker="o",ms=3,label="η = 0.8/L (inside the limit)"); ax[0].plot(hist(2.1/Lmax,16),color=ROSE,lw=2,marker="o",ms=3,label="η = 2.1/L (outside)")
ax[0].set_yscale("log"); ax[0].set_xlabel("update"); ax[0].set_ylabel("training J (log scale)"); ax[0].legend(frameon=False); ax[0].set_title("The step-size limit is 2/L")
t=np.arange(50); ax[1].step(t,0.1*0.5**(t//10),where="post",color=TEAL,lw=2,label="step decay (halve every 10)"); ax[1].plot(t,0.05*(1+np.cos(np.pi*t/50)),color=VIOLET,lw=2,label="cosine")
warm=np.where(t<5,0.1*(t+1)/5,0.05*(1+np.cos(np.pi*(t-5)/45))); ax[1].plot(t,warm,color=AMBER,lw=2,ls="--",label="warm-up + cosine")
ax[1].set_xlabel("epoch"); ax[1].set_ylabel("learning rate"); ax[1].legend(frameon=False); ax[1].set_title("Learning-rate schedules")
save(fig,"core_lr")
