(function(root){'use strict';
const flavours=[{id:'cherry',name:'Cherry Fever',color:'#e74373'},{id:'lemon',name:'Lemon Disco',color:'#fff041'},{id:'berry',name:'Berry Afterparty',color:'#be9bf0'},{id:'strawberry',name:'Strawberry Slide',color:'#fb78b4'},{id:'mango',name:'Mango Hustle',color:'#ffb449'},{id:'peach',name:'Peach Groove',color:'#ffb69d'}];
const ids=flavours.map(f=>f.id),unitCents=290;
function total(state){return ids.reduce((n,id)=>n+(state.counts[id]||0),0);}
function normalize(input){const pack=input?.pack===12?12:6,counts={};for(const id of ids){const n=input?.counts?.[id];counts[id]=Number.isInteger(n)&&n>0?Math.min(n,pack):0;}const result={pack,counts};let over=total(result)-pack;for(const id of [...ids].reverse()){const remove=Math.min(Math.max(0,over),counts[id]);counts[id]-=remove;over-=remove;}return result;}
function adjust(input,id,delta){const state=normalize(input);if(!ids.includes(id)||delta>0&&total(state)>=state.pack)return state;state.counts[id]=Math.max(0,state.counts[id]+(delta>0?1:-1));return state;}
function setPack(input,pack){return normalize({...input,pack});}
function allFlavours(pack){return normalize({pack,counts:Object.fromEntries(ids.map(id=>[id,pack===12?2:1]))});}
function snapshot(input,reference){const state=normalize(input);if(total(state)!==state.pack)throw new Error('Incomplete selection');const lines=flavours.filter(f=>state.counts[f.id]).map(f=>({id:f.id,name:f.name,qty:state.counts[f.id],unitCents,lineCents:state.counts[f.id]*unitCents}));return {reference:String(reference),pack:state.pack,lines,totalCents:state.pack*unitCents,localOnly:true,paymentProcessed:false,orderTransmitted:false};}
const api={flavours,ids,unitCents,total,normalize,adjust,setPack,allFlavours,snapshot};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FunkyWall=api;
})(typeof window!=='undefined'?window:this);
