import{e as h,q as _,c as a,a as t,u as c,g,t as o,F as f,s as v,d as k,x as w,k as p,o as r,m as d}from"./index-DyARfTVc.js";const A=`
  query Auctions {
    auctions {
      id
      title
      description
      startingPrice
      currentPrice
      minIncrement
      winnerName
      endTime
      category
      status
      participantCount
    }
  }
`,C={class:"min-h-screen bg-slate-950 px-4 py-8 text-slate-100 md:px-8"},N={class:"mx-auto max-w-7xl"},P={class:"mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-900/30 to-blue-900/20 p-6"},F={class:"flex items-center gap-2"},$={key:0,class:"mb-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"},E={key:1,class:"text-sm text-cyan-100/80"},I={key:2,class:"grid gap-4 sm:grid-cols-2 xl:grid-cols-3"},R={class:"text-xs uppercase tracking-[0.2em] text-cyan-300/70"},T={class:"mt-2 text-xl font-bold"},q={class:"mt-2 min-h-[48px] text-sm text-slate-300"},B={class:"mt-4 space-y-1 text-sm"},L={class:"font-semibold text-cyan-200"},S={class:"font-semibold"},V={class:"font-semibold"},j={class:"font-semibold"},D=["onClick"],O={__name:"AuctionsPage",setup(M){const u=k(),n=h(),m=p(!0),x=p([]),l=p(""),b=async()=>{m.value=!0,l.value="";try{const i=await w(A);x.value=i?.auctions||[]}catch(i){l.value=i?.message||"Failed to load auctions."}finally{m.value=!1}};_(async()=>{if(!n.isAuthenticated){u.push("/login");return}!n.user&&n.token&&await n.checkAuth(),await b()});const y=i=>{u.push(`/bid/${i}`)};return(i,e)=>(r(),a("main",C,[t("section",N,[t("header",P,[e[2]||(e[2]=t("div",null,[t("p",{class:"text-xs uppercase tracking-[0.2em] text-cyan-200/70"},"Auction Discovery"),t("h1",{class:"mt-1 text-3xl font-black"},"Active Auctions"),t("p",{class:"mt-1 text-sm text-cyan-100/80"},"Pick any running auction room and join instantly.")],-1)),t("div",F,[c(n).user?.is_admin?(r(),a("button",{key:0,class:"rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10",onClick:e[0]||(e[0]=s=>c(u).push("/admin/auctions"))}," Admin Panel ")):g("",!0),t("button",{class:"rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20",onClick:e[1]||(e[1]=(...s)=>c(n).logout&&c(n).logout(...s))},"Logout")])]),l.value?(r(),a("p",$,o(l.value),1)):g("",!0),m.value?(r(),a("p",E,"Loading auctions...")):(r(),a("section",I,[(r(!0),a(f,null,v(x.value,s=>(r(),a("article",{key:s.id,class:"rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg shadow-cyan-900/10"},[t("p",R,o(s.category),1),t("h2",T,o(s.title),1),t("p",q,o(s.description||"No description provided."),1),t("div",B,[t("p",null,[e[3]||(e[3]=d("Current Price: ",-1)),t("span",L,"$"+o(Number(s.currentPrice).toFixed(2)),1)]),t("p",null,[e[4]||(e[4]=d("Min Increment: ",-1)),t("span",S,"$"+o(Number(s.minIncrement).toFixed(2)),1)]),t("p",null,[e[5]||(e[5]=d("Participants: ",-1)),t("span",V,o(s.participantCount),1)]),t("p",null,[e[6]||(e[6]=d("Ends: ",-1)),t("span",j,o(s.endTime),1)])]),t("button",{class:"mt-5 w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400",onClick:Q=>y(s.id)}," Enter Auction Room ",8,D)]))),128))]))])]))}};export{O as default};
