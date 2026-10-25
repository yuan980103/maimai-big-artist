const fs=require('fs'),path=require('path');
function build(input,output){
 const raw=JSON.parse(fs.readFileSync(input,'utf8'));
 const idOk=s=>typeof s==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(s);
 if(!idOk(raw.workspaceKey)||!Array.isArray(raw.orders)||!raw.orders.length||raw.orders.length>30)throw Error('需要独立 workspaceKey 和1至30笔订单');
 const ids=new Set(),claim=s=>{if(!idOk(s)||['all','both','__proto__','constructor','prototype'].includes(s)||ids.has(s))throw Error('ID无效或重复');ids.add(s);return s};
 const text=(s,n=150)=>String(s||'').slice(0,n);
 const qty=n=>{if(!Number.isInteger(n)||n<1||n>100)throw Error('餐品份数必须为1至100');return n};
 const recipe=rows=>{if(!Array.isArray(rows)||!rows.length)throw Error('每项餐品必须提供已核实的组件，未知餐品不得猜测');return rows.map(r=>{if(!/^[a-zA-Z][a-zA-Z0-9]*$/.test(r.shape)||!['bun','beef','cheese','sauce','cola','paper','fries','red','ice','cream','lettuce','tomato','onion','chicken','fish'].includes(r.color))throw Error('组件外形或颜色无效');return{name:text(r.name),color:r.color,shape:r.shape,count:qty(r.count)}})};
 const line=(r,child=false)=>{const out={id:claim(r.id),name:text(r.name),quantity:qty(r.quantity)};if(r.customization)out.customization=text(r.customization);if(!child&&r.children?.length)out.children=r.children.map(x=>line(x,true));else out.recipe=recipe(r.recipe);return out};
 const data={workspaceKey:raw.workspaceKey,orders:raw.orders.map(o=>{if(!Array.isArray(o.lines)||!o.lines.length)throw Error('订单没有可创作餐品');return{id:claim(o.id),date:text(o.date,30),label:text(o.label,50),title:text(o.title,80),lines:o.lines.map(x=>line(x))}})};
 let html=fs.readFileSync(path.join(__dirname,'../assets/studio-template.html'),'utf8');
 const payload=JSON.stringify(data).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 html=html.replace('__MAIMAI_ORDER_DATA__',()=>payload);
 new Function(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
 if(fs.existsSync(output))throw Error('输出文件已存在，请选择新文件名，保护旧作品');
 fs.writeFileSync(output,html);return{file:output,orders:data.orders.length,bytes:Buffer.byteLength(html)};
}
if(require.main===module){if(process.argv.length!==4)throw Error('用法: node build.cjs orders.json output.html');console.log(JSON.stringify(build(process.argv[2],process.argv[3])))}
module.exports={build};
