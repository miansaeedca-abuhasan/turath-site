#!/usr/bin/env python3
"""Adds (or extends) today's «new books» card in news.json and in the inline copy in index.html.
Usage: news_card.py <entry.json>   entry = {"id","d","keys":[...],"i":{lang:[line]},"l":[link]}  (lines/keys/links are appended to an existing card of the same id)"""
import json,sys,re,os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
e=json.load(open(sys.argv[1],encoding='utf8'))
T={"ur":"نئی کتب","ar":"كتب جديدة","en":"New books","bn":"নতুন বই","hi":"नई किताबें","gu":"નવાં પુસ્તકો","fr":"Nouveaux livres"}
J=lambda o:json.dumps(o,ensure_ascii=False,separators=(',',':'))
nj=json.load(open('news.json',encoding='utf8'))
cur=[x for x in nj if x['id']==e['id']]
if cur:
    c=cur[0]
    for k in e['keys']:
        if k not in c['keys']: c['keys'].append(k)
    for l,v in e['i'].items(): c['i'][l]=c['i'].get(l,[])+[x for x in v if x not in c['i'].get(l,[])]
    for l in e['l']:
        if l not in c['l']: c['l'].append(l)
else:
    c={"id":e['id'],"d":e['d'],"keys":e['keys'],"t":T,"i":e['i'],"l":e['l']};nj.insert(0,c)
open('news.json','w',encoding='utf8').write(J(nj))
s=open('index.html',encoding='utf8').read()
m=re.search(r'\n    \{"id":"'+e['id']+r'".*?\},?\n(?=    \{"id")',s)
line='    '+J(c)+',\n'
if m: s=s[:m.start()+1]+line+s[m.end():]
else:
    i=s.index('window.NEWS = [\n')+len('window.NEWS = [\n');s=s[:i]+line+s[i:]
open('index.html','w',encoding='utf8').write(s)
print('card',c['id'],len(c['keys']),'books')
