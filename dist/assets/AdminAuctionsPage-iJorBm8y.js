import{e as R,q as B,c,a as e,u as Q,i as a,D as l,E as C,t as m,g as I,F as Y,s as G,d as H,j as J,x as z,G as P,A,k as v,o as p}from"./index-DyARfTVc.js";const K={class:"min-h-screen bg-slate-950 text-slate-100"},W={class:"mx-auto max-w-7xl px-4 py-8 md:px-8"},X={class:"mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-900/30 to-blue-900/20 p-6"},Z={class:"flex gap-2"},ee={class:"mb-8 rounded-2xl border border-white/10 bg-slate-900/70 p-6"},te={class:"mt-4 grid gap-3 md:grid-cols-3"},ne=["disabled"],re={key:0,class:"mb-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"},se={key:1,class:"mb-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"},oe={class:"rounded-2xl border border-white/10 bg-slate-900/70 p-6"},ie={key:0,class:"text-sm text-slate-300"},ae={key:1,class:"space-y-4"},le={class:"flex flex-wrap items-center justify-between gap-2"},de={class:"text-lg font-semibold"},ue={class:"rounded bg-white/10 px-2 py-1 text-xs uppercase"},ce={class:"mt-1 text-sm text-slate-300"},pe={class:"mt-1 text-xs text-slate-400"},me={class:"mt-3 flex flex-wrap gap-2"},ge=["onClick"],be=["onClick"],ye=["onClick"],xe=["onClick"],ve={key:0,class:"mt-4 grid gap-2 md:grid-cols-3"},fe={class:"flex gap-2"},he=["onClick"],$e={key:1,class:"mt-4 flex gap-2"},we=["onClick"],Ae=["onClick"],Te={key:0,class:"text-sm text-slate-400"},_e=`
  query AdminAuctions {
    adminAuctions {
      id
      title
      description
      startingPrice
      currentPrice
      minIncrement
      endTime
      category
      status
      participantCount
    }
  }
`,Ie=`
  mutation CreateAuction(
    $title: String!
    $description: String
    $startingPrice: Float!
    $minIncrement: Float!
    $endTime: String!
    $category: String!
    $status: String
  ) {
    createAuction(
      title: $title
      description: $description
      startingPrice: $startingPrice
      minIncrement: $minIncrement
      endTime: $endTime
      category: $category
      status: $status
    ) {
      id
    }
  }
`,ke=`
  mutation UpdateAuction(
    $id: ID!
    $title: String
    $description: String
    $startingPrice: Float
    $minIncrement: Float
    $currentPrice: Float
    $endTime: String
    $category: String
    $status: String
  ) {
    updateAuction(
      id: $id
      title: $title
      description: $description
      startingPrice: $startingPrice
      minIncrement: $minIncrement
      currentPrice: $currentPrice
      endTime: $endTime
      category: $category
      status: $status
    ) {
      id
    }
  }
`,Ce=`
  mutation AdjustAuctionTime($id: ID!, $deltaMinutes: Int!) {
    adjustAuctionTime(id: $id, deltaMinutes: $deltaMinutes) {
      id
      endTime
      status
    }
  }
`,Pe=`
  mutation DeleteAuction($id: ID!) {
    deleteAuction(id: $id)
  }
`,Ne={__name:"AdminAuctionsPage",setup(Ue){const h=H(),y=R(),T=v(!1),u=v(!1),g=v(""),b=v(""),_=v([]),$=v(null),s=P({title:"",description:"",startingPrice:"",minIncrement:"",endTime:"",category:"",status:"draft"}),r=P({title:"",description:"",startingPrice:"",minIncrement:"",currentPrice:"",endTime:"",category:"",status:""}),d=J(()=>y.token||localStorage.getItem("auction_access_token")),f=()=>{g.value="",b.value=""},k=o=>o?new Date(o).toISOString():null,U=o=>{if(!o)return"";const t=new Date(o),n=q=>String(q).padStart(2,"0"),i=t.getFullYear(),F=n(t.getMonth()+1),O=n(t.getDate()),j=n(t.getHours()),L=n(t.getMinutes());return`${i}-${F}-${O}T${j}:${L}`},x=async()=>{if(d.value){T.value=!0,f();try{const o=await z(_e,{},d.value);_.value=o?.adminAuctions||[]}catch(o){g.value=o?.message||"Failed to load auctions."}finally{T.value=!1}}},S=async()=>{if(d.value){u.value=!0,f();try{await A(Ie,{title:s.title.trim(),description:s.description.trim()||null,startingPrice:Number(s.startingPrice),minIncrement:Number(s.minIncrement),endTime:k(s.endTime),category:s.category.trim(),status:s.status||"draft"},d.value),b.value="Auction created successfully.",s.title="",s.description="",s.startingPrice="",s.minIncrement="",s.endTime="",s.category="",s.status="draft",await x()}catch(o){g.value=o?.message||"Failed to create auction."}finally{u.value=!1}}},N=o=>{$.value=o.id,r.title=o.title,r.description=o.description||"",r.startingPrice=String(o.startingPrice),r.minIncrement=String(o.minIncrement),r.currentPrice=String(o.currentPrice),r.endTime=U(o.endTime),r.category=o.category,r.status=o.status},M=()=>{$.value=null},V=async o=>{if(d.value){u.value=!0,f();try{await A(ke,{id:Number(o),title:r.title.trim(),description:r.description.trim()||null,startingPrice:Number(r.startingPrice),minIncrement:Number(r.minIncrement),currentPrice:Number(r.currentPrice),endTime:k(r.endTime),category:r.category.trim(),status:r.status},d.value),$.value=null,b.value="Auction updated successfully.",await x()}catch(t){g.value=t?.message||"Failed to update auction."}finally{u.value=!1}}},D=async o=>{if(!(!d.value||!window.confirm("Delete this auction permanently?"))){u.value=!0,f();try{await A(Pe,{id:Number(o)},d.value),b.value="Auction deleted successfully.",await x()}catch(n){g.value=n?.message||"Failed to delete auction."}finally{u.value=!1}}},w=async(o,t)=>{if(d.value){u.value=!0,f();try{await A(Ce,{id:Number(o),deltaMinutes:Number(t)},d.value),b.value=`Auction time adjusted by ${t} minutes.`,await x()}catch(n){g.value=n?.message||"Failed to adjust auction time."}finally{u.value=!1}}},E=async()=>{await y.logout(),h.push("/login")};return B(async()=>{if(!y.isAuthenticated){h.push("/login");return}if(!y.user&&d.value&&await y.checkAuth(),!y.user?.is_admin){h.push("/auctions");return}await x()}),(o,t)=>(p(),c("main",K,[e("section",W,[e("header",X,[t[16]||(t[16]=e("div",null,[e("p",{class:"text-xs uppercase tracking-[0.2em] text-cyan-300/80"},"Admin Control"),e("h1",{class:"mt-1 text-3xl font-black"},"Auction Management"),e("p",{class:"mt-1 text-sm text-slate-300"},"Create, update, and manage auctions from one panel.")],-1)),e("div",Z,[e("button",{class:"rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10",onClick:t[0]||(t[0]=n=>Q(h).push("/auctions"))}," Auction List "),e("button",{class:"rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold hover:bg-rose-400",onClick:E}," Logout ")])]),e("section",ee,[t[18]||(t[18]=e("h2",{class:"text-xl font-bold"},"Create Auction",-1)),e("div",te,[a(e("input",{"onUpdate:modelValue":t[1]||(t[1]=n=>s.title=n),class:"rounded-lg border border-white/15 bg-slate-950 px-3 py-2",placeholder:"Title"},null,512),[[l,s.title]]),a(e("input",{"onUpdate:modelValue":t[2]||(t[2]=n=>s.description=n),class:"rounded-lg border border-white/15 bg-slate-950 px-3 py-2",placeholder:"Purpose / Description"},null,512),[[l,s.description]]),a(e("input",{"onUpdate:modelValue":t[3]||(t[3]=n=>s.category=n),class:"rounded-lg border border-white/15 bg-slate-950 px-3 py-2",placeholder:"Category"},null,512),[[l,s.category]]),a(e("select",{"onUpdate:modelValue":t[4]||(t[4]=n=>s.status=n),class:"rounded-lg border border-white/15 bg-slate-950 px-3 py-2"},[...t[17]||(t[17]=[e("option",{value:"draft"},"draft",-1),e("option",{value:"active"},"active",-1),e("option",{value:"pending_payment"},"pending_payment",-1),e("option",{value:"closed"},"closed",-1)])],512),[[C,s.status]]),a(e("input",{"onUpdate:modelValue":t[5]||(t[5]=n=>s.startingPrice=n),type:"number",min:"0",step:"0.01",class:"rounded-lg border border-white/15 bg-slate-950 px-3 py-2",placeholder:"Starting Price"},null,512),[[l,s.startingPrice]]),a(e("input",{"onUpdate:modelValue":t[6]||(t[6]=n=>s.minIncrement=n),type:"number",min:"0",step:"0.01",class:"rounded-lg border border-white/15 bg-slate-950 px-3 py-2",placeholder:"Min Increment"},null,512),[[l,s.minIncrement]]),a(e("input",{"onUpdate:modelValue":t[7]||(t[7]=n=>s.endTime=n),type:"datetime-local",class:"rounded-lg border border-white/15 bg-slate-950 px-3 py-2"},null,512),[[l,s.endTime]])]),e("button",{class:"mt-4 rounded-lg bg-cyan-500 px-5 py-2 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50",disabled:u.value,onClick:S},m(u.value?"Saving...":"Create Auction"),9,ne)]),g.value?(p(),c("p",re,m(g.value),1)):I("",!0),b.value?(p(),c("p",se,m(b.value),1)):I("",!0),e("section",oe,[e("div",{class:"mb-4 flex items-center justify-between"},[t[19]||(t[19]=e("h2",{class:"text-xl font-bold"},"Existing Auctions",-1)),e("button",{class:"rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10",onClick:x}," Refresh ")]),T.value?(p(),c("p",ie,"Loading auctions...")):(p(),c("div",ae,[(p(!0),c(Y,null,G(_.value,n=>(p(),c("article",{key:n.id,class:"rounded-xl border border-white/10 bg-slate-950/70 p-4"},[e("div",le,[e("h3",de,m(n.title),1),e("span",ue,m(n.status),1)]),e("p",ce," Category: "+m(n.category)+" | Current: $"+m(Number(n.currentPrice).toFixed(2))+" | Ends: "+m(n.endTime),1),e("p",pe,m(n.description||"No description"),1),e("div",me,[e("button",{class:"rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs hover:bg-cyan-500/20",onClick:i=>w(n.id,5)},"+5m",8,ge),e("button",{class:"rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs hover:bg-cyan-500/20",onClick:i=>w(n.id,15)},"+15m",8,be),e("button",{class:"rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs hover:bg-amber-500/20",onClick:i=>w(n.id,-5)},"-5m",8,ye),e("button",{class:"rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs hover:bg-amber-500/20",onClick:i=>w(n.id,-15)},"-15m",8,xe)]),$.value===n.id?(p(),c("div",ve,[a(e("input",{"onUpdate:modelValue":t[8]||(t[8]=i=>r.title=i),class:"rounded-lg border border-white/15 bg-slate-900 px-3 py-2"},null,512),[[l,r.title]]),a(e("input",{"onUpdate:modelValue":t[9]||(t[9]=i=>r.description=i),class:"rounded-lg border border-white/15 bg-slate-900 px-3 py-2"},null,512),[[l,r.description]]),a(e("input",{"onUpdate:modelValue":t[10]||(t[10]=i=>r.category=i),class:"rounded-lg border border-white/15 bg-slate-900 px-3 py-2"},null,512),[[l,r.category]]),a(e("select",{"onUpdate:modelValue":t[11]||(t[11]=i=>r.status=i),class:"rounded-lg border border-white/15 bg-slate-900 px-3 py-2"},[...t[20]||(t[20]=[e("option",{value:"draft"},"draft",-1),e("option",{value:"active"},"active",-1),e("option",{value:"pending_payment"},"pending_payment",-1),e("option",{value:"closed"},"closed",-1)])],512),[[C,r.status]]),a(e("input",{"onUpdate:modelValue":t[12]||(t[12]=i=>r.startingPrice=i),type:"number",min:"0",step:"0.01",class:"rounded-lg border border-white/15 bg-slate-900 px-3 py-2"},null,512),[[l,r.startingPrice]]),a(e("input",{"onUpdate:modelValue":t[13]||(t[13]=i=>r.minIncrement=i),type:"number",min:"0",step:"0.01",class:"rounded-lg border border-white/15 bg-slate-900 px-3 py-2"},null,512),[[l,r.minIncrement]]),a(e("input",{"onUpdate:modelValue":t[14]||(t[14]=i=>r.currentPrice=i),type:"number",min:"0",step:"0.01",class:"rounded-lg border border-white/15 bg-slate-900 px-3 py-2"},null,512),[[l,r.currentPrice]]),a(e("input",{"onUpdate:modelValue":t[15]||(t[15]=i=>r.endTime=i),type:"datetime-local",class:"rounded-lg border border-white/15 bg-slate-900 px-3 py-2 md:col-span-2"},null,512),[[l,r.endTime]]),e("div",fe,[e("button",{class:"rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400",onClick:i=>V(n.id)}," Save ",8,he),e("button",{class:"rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10",onClick:M}," Cancel ")])])):(p(),c("div",$e,[e("button",{class:"rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold hover:bg-blue-400",onClick:i=>N(n)}," Edit ",8,we),e("button",{class:"rounded-lg bg-rose-500 px-3 py-2 text-sm font-semibold hover:bg-rose-400",onClick:i=>D(n.id)}," Delete ",8,Ae)]))]))),128)),_.value.length===0?(p(),c("p",Te,"No auctions found.")):I("",!0)]))])])]))}};export{Ne as default};
