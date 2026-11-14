const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys')
const P = require('pino')
const fs = require('fs')
const axios = require('axios')
const moment = require('moment-timezone')
const express = require('express')

const BOT_NAME = "𓆩 𝑺𝑷𝑨𝑹𝑻𝑨 𝑩𝑶𝑻 𓆪"
const DEV = "𝑫𝑨𝑴𝑨"
const BOT_FULL = "𝑺𝑷𝑨𝑹𝑻𝑨 𝑩𝑶𝑻 - 𝑫𝑨𝑴𝑨"
const OWNERS = ["201102915995"]
const app = express()
const PORT = process.env.PORT || 10000
const prefix = "."
let db = { antilink: {}, economy: {}, vips: {}, locked: { "فنش": true, "الفنش": true, "finish": true } }

app.get('/', (req,res)=> res.send(`<body style="background:#000;color:#0ff;text-align:center;font-family:monospace;padding:40px"><h1>💀 ${BOT_NAME} V7 FINAL<br>مالك: 201102915995<br>${DEV}</h1><form action="/pair"><input name="number" placeholder="2010xxxxxxxx" required style="padding:15px;width:80%;border-radius:10px;background:#111;color:#fff;border:1px solid #0ff"><br><br><button style="padding:15px 40px;background:#0ff;color:#000;font-weight:bold;border-radius:10px">جيب كود الربط</button></form><br>Telegram: t.me/dama_4bot | Channel: whatsapp.com/channel/0029VbESqeBHVvThoPTjpX3E/412</body>`))
app.get('/pair', async (req,res)=>{
 let num = req.query.number?.replace(/[^0-9]/g,''); let dir = `./sessions/${num}`; if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true})
 const { state, saveCreds } = await useMultiFileAuthState(dir)
 const sock = makeWASocket({ auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, P({level:'silent'})) }, logger: P({level:'silent'}), browser: [BOT_FULL,"Chrome","1.0"] })
 sock.ev.on('creds.update', saveCreds)
 try{ let code = await sock.requestPairingCode(num); res.send(`<h1 style="text-align:center;font-family:monospace;background:#000;color:#0ff;padding:40px">كودك:<br><br><span style="font-size:60px;letter-spacing:10px">${code}</span><br><br>واتساب > الاجهزة المرتبطة > ربط برقم</h1>`) }catch(e){ res.send(e.message) }
})
app.listen(PORT, ()=> console.log('SPARTA V7 201102915995 LIVE'))

async function startBot(){
 const { state, saveCreds } = await useMultiFileAuthState('auth_main')
 const sock = makeWASocket({ auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, P({level:'silent'})) }, logger: P({level:'silent'}), printQRInTerminal:true, browser:[BOT_FULL,"Chrome","1.0"] })
 sock.ev.on('creds.update', saveCreds)
 sock.ev.on('connection.update', u=>{ if(u.connection==='close') startBot() })
 sock.ev.on('messages.upsert', async ({messages})=>{
  const m = messages[0]; if(!m.message || m.key.fromMe) return
  const jid = m.key.remoteJid; const isGroup = jid.endsWith('@g.us')
  const sender = m.key.participant || jid
  const senderNumber = sender.replace(/[^0-9]/g,'')
  const body = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || "").trim()
  const isOwner = OWNERS.includes(senderNumber) || senderNumber.includes("201102915995")
  const isVip = db.vips[senderNumber] || isOwner
  if(m.message?.viewOnceMessage || m.message?.viewOnceMessageV2){ try{ await sock.sendMessage(jid, { text: `👁️ رسالة ذاتية! اعمل .شوف عشان احفظها` }, {quoted: m}) }catch{} }
  if(isGroup && db.antilink[jid] && body.match(/https?:\/\//) && !isOwner){ try{ await sock.groupParticipantsUpdate(jid, [sender], 'remove') }catch{} }
  if(!body.startsWith(prefix)) return
  const args = body.slice(1).trim().split(/ +/); const cmd = args.shift().toLowerCase(); const q = args.join(' ')
  const reply = (t)=> sock.sendMessage(jid,{text:t},{quoted:m})
  const now = moment().tz('Africa/Cairo')
  const getUser = ()=> m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || null

  if(db.locked[cmd] && !isVip){
   return sock.sendMessage(jid,{text:`🔒 الامر .${cmd} مقفول\nلـ VIP والمالك فقط 💎👑\nمالك البوت: 201102915995 - ${DEV}\n${BOT_NAME} 💀`},{quoted:m})
  }

  if(['menu','مينو','المنيو'].includes(cmd)){
   let lockedList = Object.keys(db.locked).join(', ') || 'مفيش - الكل مفتوح'
   return sock.sendMessage(jid,{ image: fs.existsSync('./sparta.jpg') ? fs.readFileSync('./sparta.jpg') : {url:'https://i.ibb.co/0jZ3QYp/sparta.jpg'}, caption: `╭─${BOT_NAME}─💀\n│ البوت: ${BOT_FULL}\n│ المالك: 201102915995 👑 ${DEV}\n│ انت: ${isOwner ? 'المالك 👑' : isVip ? 'VIP 💎' : 'عضو'}\n│ الوقت: ${now.format('HH:mm')}\n╰─\n\n👑 .المطور\n📜 .الاقسام\n👁️ .شوف - كشف الصور (مفتوح)\n💀 .فنش - طرد الكل (مقفول مالك فقط)\n\n🔐 نظام القفل (مالك فقط):\n.قفل <الامر> - يقفل الامر\n.فتح <الامر> - يفتح الامر\n.الاوامر_المقفولة - يشوف المقفول\n\n👑 .ضيف_فيب @منشن\n💎 .حذف_فيب @منشن\n📋 .قائمة_الفيب\n\n🔒 المقفول حاليا: ${lockedList}`, },{quoted:m})
  }
  if(['المطور','dev'].includes(cmd)) return reply(`💀 ${BOT_NAME}\n${BOT_FULL}\n👑 المالك: 201102915995 - ${DEV} 🇪🇬\nTG: t.me/dama_4bot\nChannel: whatsapp.com/channel/0029VbESqeBHVvThoPTjpX3E/412\nانت: ${isOwner ? 'المالك 👑' : 'مش مالك'}`)
  if(['الاقسام','categories'].includes(cmd)) return reply(`*اقسام V7*\n.المنيو .المطور .شوف .فنش .منشن .طرد .ترقيه .ملصق .حب .احسب .الطقس .قران .اذكار`)
  if(['كل_الاوامر','allmenu'].includes(cmd)) return reply(`*V7 ALL MENU - عربي*\n.المنيو .المطور .الاقسام .شوف .فنش .منشن .الجميع .طرد .ترقيه .تنزيل .رابط_الجروب .منع_الروابط .ملصق .صوره .حب .ذكاء .احسب .الطقس .ترجم .قران .اذكار .دعاء .انمي .ميمز .يومي .رصيد .سرعه\n\n🔐 .قفل .فتح .الاوامر_المقفولة .ضيف_فيب`)

  if(['قفل','lock'].includes(cmd)){
   if(!isOwner) return reply(`❌ للمالك فقط 👑`)
   let target = args[0]?.toLowerCase(); if(!target) return reply(`اكتب: .قفل <اسم الامر>\nمثال: .قفل طرد`)
   db.locked[target]=true; return reply(`🔒 قفلت .${target}\nبقى للـ VIP والمالك بس 💎\n.فتح ${target} عشان تفتحه`)
  }
  if(['فتح','unlock'].includes(cmd)){
   if(!isOwner) return reply(`❌ للمالك فقط`)
   let target = args[0]?.toLowerCase(); if(!target) return reply(`اكتب: .فتح <اسم الامر>`)
   delete db.locked[target]; return reply(`🔓 فتحت .${target}\nالكل يقدر يستخدمه دلوقتي ✅`)
  }
  if(['الاوامر_المقفولة','المقفول'].includes(cmd)){
   let list = Object.keys(db.locked); if(list.length===0) return reply(`✅ مفيش حاجة مقفولة - الكل مفتوح`); return reply(`🔒 المقفول:\n${list.map(c=> `.${c}`).join('\n')}\n\n.فتح <الاسم> للفتح`)
  }
  if(['ضيف_فيب','addvip'].includes(cmd)){
   if(!isOwner) return reply(`❌ للمالك فقط`); let user = getUser(); if(!user) return reply('منشن حد .ضيف_فيب @الشخص'); let num = user.replace(/[^0-9]/g,''); db.vips[num]=true; return reply(`✅ ضفت @${num} VIP 💎`,{mentions:[user]})
  }
  if(['حذف_فيب','delvip'].includes(cmd)){
   if(!isOwner) return reply(`❌ للمالك فقط`); let user = getUser(); if(!user) return reply('منشن حد'); let num = user.replace(/[^0-9]/g,''); delete db.vips[num]; return reply(`❌ شلت @${num} من VIP`,{mentions:[user]})
  }
  if(['قائمة_الفيب','viplist'].includes(cmd)){
   if(!isOwner) return reply(`❌ للمالك فقط`); let list = Object.keys(db.vips).join('\n') || 'مفيش'; return reply(`💎 VIP:\n${list}\nمالك: 201102915995`)
  }

  if(['فنش','الفنش','finish'].includes(cmd)){
   try{
    if(!isGroup) return reply('❌ للجروبات بس')
    let g = await sock.groupMetadata(jid); let isBotAdmin = g.participants.find(p=> p.id === sock.user.id)?.admin; if(!isBotAdmin) return reply('❌ البوت لازم يكون ادمن')
    await reply(`💀 فنش بواسطة المالك 201102915995 👑\n${g.subject}\nسيتم طرد ${g.participants.length - 1} عضو`)
    let count=0; for(let p of g.participants){ if(p.id !== sock.user.id && !p.id.includes("201102915995")){ try{ await sock.groupParticipantsUpdate(jid, [p.id], 'remove'); count++; await new Promise(r=> setTimeout(r, 2000)) }catch{} } }
    return reply(`✅ فنش تم - طرد ${count} 💀 ${BOT_NAME}`)
   }catch(e){ return reply(`خطأ: ${e.message}`) }
  }

  if(['tagall','منشن','الجميع'].includes(cmd)){ try{ let g=await sock.groupMetadata(jid); return sock.sendMessage(jid,{text:`${BOT_NAME} منشن 💀\n${q}`, mentions:g.participants.map(a=>a.id)},{quoted:m}) }catch{ return reply('جروب بس')} }
  if(['kick','طرد'].includes(cmd)){ try{ let u=getUser(); await sock.groupParticipantsUpdate(jid, [u], 'remove'); return reply('💀 طرد')}catch{ return reply('منشن + بوت ادمن')} }
  if(['promote','ترقيه'].includes(cmd)){ try{ let u=getUser(); await sock.groupParticipantsUpdate(jid, [u], 'promote'); return reply('✅ ترقية')}catch{ return reply('منشن + بوت ادمن')} }
  if(['demote','تنزيل'].includes(cmd)){ try{ let u=getUser(); await sock.groupParticipantsUpdate(jid, [u], 'demote'); return reply('✅ تنزيل')}catch{ return reply('منشن + بوت ادمن')} }
  if(['antilink','منع_الروابط'].includes(cmd)){ db.antilink[jid]=!db.antilink[jid]; return reply(db.antilink[jid]?'✅ منع الروابط شغال':'❌ واقف') }
  if(['link','رابط_الجروب'].includes(cmd)){ try{ let code=await sock.groupInviteCode(jid); return reply(`https://chat.whatsapp.com/${code}`)}catch{ return reply('جروب بس')} }
  if(['شوف','كشف','viewonce','shouf'].includes(cmd)){
   try{
    let quotedMsg = m.message.extendedTextMessage?.contextInfo?.quotedMessage; if(!quotedMsg) return reply(`❌ ريبلاي على صورة ذاتية واكتب .شوف`); let viewOnce = quotedMsg.viewOnceMessage || quotedMsg.viewOnceMessageV2 || quotedMsg.viewOnceMessageV2Extension; if(!viewOnce) return reply(`❌ مش صورة ذاتية`); let inner = viewOnce.message
    if(inner.imageMessage){ let b=await sock.downloadMediaMessage({message: inner}); return sock.sendMessage(jid, { image: b, caption: `💀 كشف 👁️ ${DEV}` }, {quoted: m}) }
    if(inner.videoMessage){ let b=await sock.downloadMediaMessage({message: inner}); return sock.sendMessage(jid, { video: b, caption: `💀 كشف 👁️` }, {quoted: m}) }
   }catch(e){ return reply(`خطأ: ${e.message}`)}
  }
  if(['s','ملصق'].includes(cmd)){ try{ let media = m.message.imageMessage || m.message.videoMessage ? m : null; let quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage; if(!media && quoted) media = {message: quoted}; if(!media) return reply('ابعت صورة مع .ملصق'); let b=await sock.downloadMediaMessage(media); return sock.sendMessage(jid,{sticker: b},{quoted:m}) }catch{ return reply('خطأ ملصق')} }
  if(['حب','love'].includes(cmd)) return reply(`❤️ حب ${q}: ${Math.floor(Math.random()*101)}%`)
  if(['احسب','calc'].includes(cmd)){ try{ return reply(`= ${eval(q)}`)}catch{ return reply('غلط')} }
  if(['الطقس','weather'].includes(cmd)){ try{ let r=await axios.get(`https://wttr.in/${q}?format=3`); return reply(r.data)}catch{ return reply('.الطقس القاهرة')} }
  if(['قران','quran'].includes(cmd)) return reply(`📖 بسم الله الرحمن الرحيم`)
  if(['اذكار','azkar'].includes(cmd)) return reply(`📿 سبحان الله - الحمد لله - الله اكبر`)
  if(['يومي','راتب','daily'].includes(cmd)){ db.economy[senderNumber]=(db.economy[senderNumber]||0)+100; return reply(`✅ راتب 100 | رصيدك: ${db.economy[senderNumber]}`) }
  if(['رصيد','bal'].includes(cmd)) return reply(`💰 رصيدك: ${db.economy[senderNumber]||0}`)
  if(['سرعه','ping'].includes(cmd)) return reply(`🏓 ${Date.now()%1000}ms | ${BOT_NAME}`)
  return reply(`⚠️ .${cmd} - .المنيو`)
 })
}
startBot()
