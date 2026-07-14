const fs=require('fs'),assert=require('assert'),child=require('child_process');

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('style.css','utf8');
const script=fs.readFileSync('script.js','utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
const unique=new Set(ids);

assert.equal(ids.length,unique.size,'duplicate HTML ids found');
for(const match of script.matchAll(/\$\('([^']+)'\)/g)){
  assert(unique.has(match[1]),'script references missing element #'+match[1]);
}

const openBraces=(css.match(/{/g)||[]).length;
const closeBraces=(css.match(/}/g)||[]).length;
assert.equal(openBraces,closeBraces,'CSS braces are unbalanced');
assert(html.includes('style.css?v=0.3.0')&&html.includes('script.js?v=0.3.0'),'release assets are not versioned');
assert(!/v0\.2\.0/.test(html+css+script),'stale release version found');

child.execFileSync(process.execPath,['--check','script.js'],{stdio:'inherit'});
console.log('Static audit passed: unique ids -> DOM bindings -> CSS balance -> JS syntax');
