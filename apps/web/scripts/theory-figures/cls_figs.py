from style import *
import numpy as np
from math import comb
# softmax
z=np.array([2.0,1.0,0.1]); p=np.exp(z-z.max()); p/=p.sum()
fig,ax=plt.subplots(1,2,figsize=(9,3.2))
lab=["cat","dog","bird"]
ax[0].bar(lab,z,color=[TEAL,LIGHT,LIGHT]); ax[0].set_title("Raw scores (logits) z"); [ax[0].text(i,z[i]+.05,f"{z[i]:.1f}",ha="center") for i in range(3)]
ax[1].bar(lab,p,color=[TEAL,LIGHT,LIGHT]); ax[1].set_title("After softmax: probabilities"); ax[1].set_ylim(0,1); [ax[1].text(i,p[i]+.02,f"{p[i]:.3f}",ha="center") for i in range(3)]
save(fig,"cls_softmax")
# ROC + PR from 8 alerts
score=np.array([.92,.79,.74,.58,.51,.44,.23,.12]); y=np.array([1,0,1,0,1,0,0,0])
tpr=[0];fpr=[0];prec=[];rec=[]
P=y.sum();N=len(y)-P;tp=fp=0
for s,l in zip(score,y):
    tp+=l; fp+=1-l; tpr.append(tp/P); fpr.append(fp/N); prec.append(tp/(tp+fp)); rec.append(tp/P)
fig,ax=plt.subplots(1,2,figsize=(9.6,3.8))
ax[0].step(fpr,tpr,where="post",color=TEAL,lw=2.5); ax[0].fill_between(fpr,tpr,step="post",color=TEAL,alpha=.12)
ax[0].plot([0,1],[0,1],ls=":",color=LIGHT); ax[0].scatter([0.4],[1.0],color=AMBER,zorder=4,s=60); ax[0].annotate("threshold 0.50",(0.4,1.0),(0.5,0.78),arrowprops=dict(arrowstyle="->",color=AMBER),color=AMBER)
ax[0].set_xlabel("false-positive rate"); ax[0].set_ylabel("true-positive rate (recall)"); ax[0].set_title("ROC curve  ·  AUC = 12/15 = 0.80")
ax[1].plot(rec,prec,marker="o",color=VIOLET,lw=2); ax[1].axhline(P/len(y),ls=":",color=LIGHT); ax[1].text(0.04,P/len(y)+.03,"random guessing = prevalence 3/8",color=SLATE,fontsize=9)
ax[1].set_xlabel("recall"); ax[1].set_ylabel("precision"); ax[1].set_ylim(0,1.05); ax[1].set_xlim(0,1.05); ax[1].set_title("Precision–recall (each point = top-k alerts)")
save(fig,"cls_roc_pr")
# calibration
rng=np.random.default_rng(2); true_p=rng.uniform(0,1,4000); yy=rng.uniform(0,1,4000)<true_p
over=np.clip(0.5+1.8*(true_p-0.5),0.001,0.999)
fig,ax=plt.subplots(figsize=(5.2,4.2))
bins=np.linspace(0,1,11)
for pr,c,l in [(true_p,TEAL,"well calibrated"),(over,ROSE,"over-confident")]:
    idx=np.digitize(pr,bins)-1; mp=[pr[idx==k].mean() for k in range(10) if (idx==k).sum()>20]; fr=[yy[idx==k].mean() for k in range(10) if (idx==k).sum()>20]
    ax.plot(mp,fr,marker="o",color=c,label=l,lw=2)
ax.plot([0,1],[0,1],ls=":",color=LIGHT,label="perfect"); ax.set_xlabel("predicted probability (bin average)"); ax.set_ylabel("fraction actually positive"); ax.legend(frameon=False); ax.set_title("Reliability diagram")
save(fig,"cls_calibration")
# adaboost weights
fig,ax=plt.subplots(figsize=(6.2,3.1)); xs=np.arange(1,6)
ax.bar(xs-.18,[.2]*5,.34,color=LIGHT,label="before (equal)"); ax.bar(xs+.18,[.125,.125,.5,.125,.125],.34,color=[TEAL,TEAL,ROSE,TEAL,TEAL],label="after round 1")
ax.set_xticks(xs); ax.set_xticklabels(["pt 1","pt 2","pt 3\n(misclassified)","pt 4","pt 5"]); ax.set_ylabel("sample weight"); ax.legend(frameon=False); ax.set_title("AdaBoost: the mistake now carries half the total weight")
save(fig,"cls_adaboost_weights")
# boosting stages
x=np.arange(6); t=np.array([2,3,4,7,8,9.])
fig,ax=plt.subplots(figsize=(6.4,3.6)); ax.scatter(x,t,color=SLATE,zorder=4,label="targets")
for v,c,l in [([5.5]*6,LIGHT,"round 0: mean 5.5"),([4.75]*3+[6.25]*3,AMBER,"after tree 1"),([4.225]*3+[6.775]*3,TEAL,"after tree 2")]:
    ax.step(np.r_[x-.5,5.5],np.r_[v,v[-1]],where="post",color=c,lw=2.4,label=l)
ax.set_xlabel("feature x"); ax.set_ylabel("prediction"); ax.legend(frameon=False,loc="upper left"); ax.set_title("Each tree nudges predictions toward the targets")
save(fig,"cls_boosting_stages")
# majority vote accuracy
fig,ax=plt.subplots(figsize=(6.2,3.4)); ns=np.arange(1,32,2)
for pacc,c in [(0.7,TEAL),(0.6,AMBER),(0.5,ROSE)]:
    acc=[sum(comb(n,k)*pacc**k*(1-pacc)**(n-k) for k in range(n//2+1,n+1)) for n in ns]; ax.plot(ns,acc,marker="o",ms=3,color=c,label=f"each model {int(pacc*100)}% accurate")
ax.set_xlabel("number of independent models voting"); ax.set_ylabel("majority-vote accuracy"); ax.set_ylim(.4,1.01); ax.legend(frameon=False); ax.set_title("Voting helps only if models are better than chance AND independent")
save(fig,"cls_voting")
