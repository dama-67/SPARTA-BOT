 const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, delay } = require('@whiskeysockets/baileys')
const P = require('pino')
const fs = require('fs')
const axios = require('axios')
const moment = require('moment-timezone')
const express = require('express')

const BOT_NAME = "𓆩 𝑺𝑷𝑨𝑹𝑻𝑨 𝑩𝑶𝑻 𓆪"
const DEV = "𝑫𝑨𝑴𝑨"
const OWNERS = ["201102915995"]
const app = express()
const PORT = process.env.PORT || 10000
const prefix = "."
let db = { antilink: {}, economy: {}, vips: {}, locked: { "فنش": true, "الفنش": true, "finish": true } }

app.get('/', (req,res)=> res.send(`<body style="background:#000;color:#0ff;text-align:center;font-family:monospace;padding:40px"><h1>💀 ${BOT_NAME} V7 FINAL<br>مالك: 201102915995<br>${DEV}</h1><form action="/pair"><input name="number" placeholder="201102915995" required style="padding:15px;width:80%;border-radius:10px;background:#111;color:#fff;border:1px solid #0ff"><br><br><button style="padding:15px 40px;background:#0ff;color:#000;font-weight:bold;border-radius:10px">جيب كود الربط</button></form></body>`))

app.get('/pair', async (req,res)=>{
 try{
  let num = req.query.number?.replace(/[^0-9]/g,'')
  if(!num) return res.send('اكتب رقمك')
  let dir = `./sessions/${num}`
  if(fs.existsSync(dir)) fs.rmSync(dir,{recursive:true,force:true})
  fs.mkdirSync(dir,{recursive:true})
  const { state, saveCreds } = await useMultiFileAuthState(dir)
  const sock = makeWASocket({ auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, P({level:'silent'})) }, logger: P({level:'silent'}), printQRInTerminal:false, browser: ["SPARTA BOT - DAMA","Chrome","1.0"] })
  sock.ev.on('creds.update', saveCreds)
  await delay(3000)
  let code = await sock.requestPairingCode(num)
  console.log('CODE:', code)
  res.send(`<body style="background:#000;color:#fff;text-align:center;font-family:monospace;padding:30px"><h1>كودك:</h1><h1 style="font-size:70px;color:#0ff;letter-spacing:12px">${code}</h1><p>واتساب > الاجهزة المرتبطة > ربط برقم<br>اكتبه في خلال 60 ثانية</p><p>مالك البوت: 201102915995</p></body>`)
 }catch(e){
  console.log(e)
  res.send(`<body style="background:#000;color:red;text-align:center;padding:20px"><h1>خطأ: ${e.message}</h1><p>جرب تاني بعد 30 ثانية - امسح فولدر sessions من Render</p><a href="/">رجوع</a></body>`)
 }
})
app.listen(PORT, ()=> console.log('LIVE'))

async function startBot(){
 const { state, saveCreds } = await useMultiFileAuthState('auth_main')
 const sock = makeWASocket({ auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, P({level:'silent'})) }, logger: P({level:'silent'}), printQRInTerminal:false, browser:["SPARTA BOT - DAMA","Chrome","1.0"] })
 sock.ev.on('creds.update', saveCreds)
 sock.ev.on('connection.update', u=>{ console.log(u); if(u.connection==='close') setTimeout(startBot,5000) })
 sock.ev.on('messages.upsert', async ({messages})=>{
  const m = messages[0]; if(!m.message || m.key.fromMe) return
  const jid = m.key.remoteJid; const isGroup = jid.endsWith('@g.us')
  const sender = m.key.participant || jid
  const senderNumber = sender.replace(/[^0-9]/g,'')
  const body = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || "").trim()
  const isOwner = OWNERS.includes(senderNumber) || senderNumber.includes("201102915995")
  const isVip = db.vips[senderNumber] || isOwner
  if(!body.startsWith(prefix)) return
  const args = body.slice(1).trim().split(/ +/); const cmd = args.shift().toLowerCase(); const q = args.join(' ')
  const reply = (t)=> sock.sendMessage(jid,{text:t},{quoted:m})
  const now = moment().tz('Africa/Cairo')
  const getUser = ()=> m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || null
  if(db.locked[cmd] && !isVip) return reply(`🔒 .${cmd} مقفول VIP/مالك فقط 👑 مالك: 201102915995`)
  if(['menu','مينو','المنيو'].includes(cmd)){ let lockedList = Object.keys(db.locked).join(', ') || 'مفيش'; return sock.sendMessage(jid,{ image: fs.existsSync('./sparta.jpg') ? fs.readFileSync('./sparta.jpg') : {url:'https://i.ibb.co/0jZ3QYp/sparta.jpg'}, caption: `╭─${BOT_NAME}─💀\n│ المالك: 201102915995 👑 ${DEV}\n│ انت: ${isOwner ? 'المالك 👑' : isVip ? 'VIP 💎' : 'عضو'}\n│ الوقت: ${now.format('HH:mm')}\n╰─\n📜 .الاقسام 👑 .المطور 👁️ .شوف 💀 .فنش\n🔐 .قفل .فتح .الاوامر_المقفولة\n👑 .ضيف_فيب .حذف_فيب .قائمة_الفيب\n🔒 مقفول: ${lockedList}`, },{quoted:m}) }
  if(['المطور','dev'].includes(cmd)) return reply(`💀 ${BOT_NAME}\n👑 المالك: 201102915995 - ${DEV}\nانت: ${isOwner ? 'المالك 👑' : 'مش مالك'}`)
  if(['الاقسام','categories'].includes(cmd)) return reply(`*اقسام V7* .المنيو .المطور .شوف .فنش .منشن .طرد .ترقيه .ملصق .حب .احسب .الطقس .قران`)
  if(['قفل','lock'].includes(cmd)){ if(!isOwner) return reply(`❌ للمالك فقط`); let t=args[0]?.toLowerCase(); if(!t) return reply(`.قفل <اسم الامر>`); db.locked[t]=true; return reply(`🔒 قفلت .${t} - بقى VIP/مالك بس`) }
  if(['فتح','unlock'].includes(cmd)){ if(!isOwner) return reply(`❌ للمالك فقط`); let t=args[0]?.toLowerCase(); if(!t) return reply(`.فتح <اسم الامر>`); delete db.locked[t]; return reply(`🔓 فتحت .${t} - الكل يقدر يستخدمه`) }
  if(['الاوامر_المقفولة','المقفول'].includes(cmd)){ let list = Object.keys(db.locked); if(list.length===0) return reply(`✅ مفيش حاجة مقفولة`); return reply(`🔒 المقفول:\n${list.map(c=> `.${c}`).join('\n')}`) }
  if(['ضيف_فيب','addvip'].includes(cmd)){ if(!isOwner) return reply(`❌ للمالك فقط`); let user = getUser(); if(!user) return reply('منشن حد'); let num = user.replace(/[^0-9]/g,''); db.vips[num]=true; return reply(`✅ ضفت @${num} VIP 💎`,{mentions:[user]}) }
  if(['حذف_فيب','delvip'].includes(cmd)){ if(!isOwner) return reply(`❌ للمالك فقط`); let user = getUser(); if(!user) return reply('منشن حد'); let num = user.replace(/[^0-9]/g,''); delete db.vips[num]; return reply(`❌ شلت @${num}` ,{mentions:[user]}) }
  if(['قائمة_الفيب','viplist'].includes(cmd)){ if(!isOwner) return reply(`❌ للمالك فقط`); let list = Object.keys(db.vips).join('\n') || 'مفيش'; return reply(`💎 VIP:\n${list}`) }
  if(['فنش','الفنش','finish'].includes(cmd)){ try{ if(!isGroup) return reply('❌ جروبات بس'); let g = await sock.groupMetadata(jid); let isBotAdmin = g.participants.find(p=> p.id === sock.user.id)?.admin; if(!isBotAdmin) return reply('❌ البوت لازم ادمن'); await reply(`💀 فنش بواسطة المالك 201102915995 👑 ${g.subject}`); let count=0; for(let p of g.participants){ if(p.id !== sock.user.id && !p.id.includes("201102915995")){ try{ await sock.groupParticipantsUpdate(jid, [p.id], 'remove'); count++; await delay(2000) }catch{} } } return reply(`✅ فنش تم - ${count}`) }catch(e){ return reply(`خطأ: ${e.message}`) } }
  if(['tagall','منشن','الجميع'].includes(cmd)){ try{ let g=await sock.groupMetadata(jid); return sock.sendMessage(jid,{text:`${BOT_NAME} منشن 💀\n${q}`, mentions:g.participants.map(a=>a.id)},{quoted:m}) }catch{ return reply('جروب بس')} }
  if(['kick','طرد'].includes(cmd)){ try{ let u=getUser(); await sock.groupParticipantsUpdate(jid, [u], 'remove'); return reply('💀 طرد')}catch{ return reply('منشن + بوت ادمن')} }
  if(['promote','ترقيه'].includes(cmd)){ try{ let u=getUser(); await sock.groupParticipantsUpdate(jid, [u], 'promote'); return reply('✅ ترقية')}catch{ return reply('منشن + بوت ادمن')} }
  if(['شوف','كشف','viewonce'].includes(cmd)){ try{ let quotedMsg = m.message.extendedTextMessage?.contextInfo?.quotedMessage; if(!quotedMsg) return reply(`❌ ريبلاي على صورة ذاتية`); let viewOnce = quotedMsg.viewOnceMessage || quotedMsg.viewOnceMessageV2 || quotedMsg.viewOnceMessageV2Extension; if(!viewOnce) return reply(`❌ مش ذاتية`); let inner = viewOnce.message; if(inner.imageMessage){ let b=await sock.downloadMediaMessage({message: inner}); return sock.sendMessage(jid, { image: b, caption: `💀 كشف 👁️ ${DEV}` }, {quoted: m}) } if(inner.videoMessage){ let b=await sock.downloadMediaMessage({message: inner}); return sock.sendMessage(jid, { video: b, caption: `💀 كشف 👁️` }, {quoted: m}) } }catch(e){ return reply(`خطأ: ${e.message}`)} }
  if(['s','ملصق'].includes(cmd)){ try{ let media = m.message.imageMessage || m.message.videoMessage ? m : null; let quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage; if(!media && quoted) media = {message: quoted}; if(!media) return reply('ابعت صورة مع .ملصق'); let b=await sock.downloadMediaMessage(media); return sock.sendMessage(jid,{sticker: b},{quoted:m}) }catch{ return reply('خطأ')} }
  if(['حب','love'].includes(cmd)) return reply(`❤️ حب ${q}: ${Math.floor(Math.random()*101)}%`)
  if(['احسب','calc'].includes(cmd)){ try{ return reply(`= ${eval(q)}`)}catch{ return reply('غلط')} }
  if(['سرعه','ping'].includes(cmd)) return reply(`🏓 ${Date.now()%1000}ms`)
  return reply(`⚠️ .${cmd} - .المنيو`)
 })
}
startBot()
