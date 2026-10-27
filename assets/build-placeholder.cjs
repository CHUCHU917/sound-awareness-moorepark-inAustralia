// Optional source generator for the replaceable, single-image SVG scene.
const fs = require('node:fs');
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
<defs>
<linearGradient id="sky" x2="0" y2="1"><stop stop-color="#455567"/><stop offset=".53" stop-color="#827472"/><stop offset="1" stop-color="#c0a08b"/></linearGradient>
<linearGradient id="ground" x2=".5" y2="1"><stop stop-color="#5c6766"/><stop offset="1" stop-color="#303f41"/></linearGradient>
<linearGradient id="step" x2="0" y2="1"><stop stop-color="#87918b"/><stop offset=".7" stop-color="#727e7a"/><stop offset=".73" stop-color="#444e4d"/><stop offset="1" stop-color="#4a5655"/></linearGradient>
<linearGradient id="stadium" x2="1" y2="1"><stop stop-color="#3e535b"/><stop offset="1" stop-color="#1d3038"/></linearGradient>
<linearGradient id="walk" x2="1" y2="1"><stop stop-color="#7e8881"/><stop offset="1" stop-color="#4a5652"/></linearGradient>
<radialGradient id="lamp"><stop stop-color="#fff2c9" stop-opacity=".42"/><stop offset="1" stop-color="#ecca84" stop-opacity="0"/></radialGradient>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".075"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/></filter>
<clipPath id="stairs"><path d="M560 200H1020L1350 1000H130Z"/></clipPath>
</defs>
<rect width="1600" height="1000" fill="url(#sky)"/>
<path d="M0 210L165 178 243 190 342 160 430 175 510 154 610 181 685 160 760 180 890 155 1040 167 1160 143 1310 164 1430 140 1600 165V360H0Z" fill="#3e5052"/>
<path d="M1010 182L1160 128 1190 133 1190 192 1300 147 1375 161 1375 209 1520 150 1600 163V325H1000Z" fill="#2d4247"/>
<g fill="#c4b58c" opacity=".65"><path d="M1181 151h4v11h-4zM1181 175h4v11h-4zM1321 170h7v10h-7zM1341 171h7v10h-7zM1503 183h5v10h-5zM1532 174h6v10h-6z"/></g>
<path d="M0 0H550L566 180 509 303 0 611Z" fill="url(#stadium)"/>
<path d="M0 4H513L554 139 0 431Z" fill="#263f4a"/>
<path d="M0 67L520 34 530 68 0 149Z" fill="#657578" opacity=".5"/>
<path d="M0 178L545 105 549 115 0 208ZM0 265L552 144 554 154 0 298Z" fill="#9aaca6" opacity=".25"/>
<g stroke="#718181" stroke-width="4" opacity=".6"><path d="M100 0L119 359M220 0L248 287M338 0L370 223M450 0L480 168"/></g>
<path d="M0 344L562 181 557 218 0 445Z" fill="#bcc6b3" opacity=".45"/>
<path d="M0 436L550 223 554 259 0 570Z" fill="#273a3e"/>
<path d="M0 500L560 200H1020L1600 500V1000H0Z" fill="url(#ground)"/>
<path d="M1035 220L1600 315V521L1092 385Z" fill="#263b37"/>
<path d="M1080 205L1220 163 1400 208 1600 181V387L1140 301Z" fill="#31453d"/>
<g fill="#263d35"><circle cx="1190" cy="214" r="62"/><circle cx="1276" cy="200" r="73"/><circle cx="1372" cy="240" r="90"/><circle cx="1497" cy="233" r="103"/><circle cx="1581" cy="276" r="100"/></g>
<g fill="#3d5143" opacity=".65"><circle cx="1210" cy="179" r="37"/><circle cx="1305" cy="174" r="39"/><circle cx="1436" cy="201" r="49"/><circle cx="1558" cy="199" r="50"/></g>
<path d="M1030 245L1600 402V485L1075 340Z" fill="url(#walk)"/>
<path d="M1110 360L1600 490" stroke="#afb5a0" stroke-width="3" opacity=".4"/>
<path d="M1040 209L1135 218 1510 1000H1350Z" fill="#56665e"/>
<path d="M518 205H560L130 1000H0Z" fill="#364b46"/>
<path d="M560 200H1020L1350 1000H130Z" fill="#727d77"/>
<g clip-path="url(#stairs)" filter="url(#grain)">`;
for (let i=0;i<34;i++) {
  let y=200+800*Math.pow(i/34,1.4), next=200+800*Math.pow((i+1)/34,1.4);
  svg += `<rect x="110" y="${y}" width="1270" height="${next-y}" fill="url(#step)"/><path d="M110 ${y+.7}H1380" stroke="#b5baab" opacity=".35"/>`;
}
svg += `</g><g fill="none" stroke-linecap="round"><path d="M555 174L100 1000M1023 172L1380 1000" stroke="#192f31" stroke-width="9"/><path d="M555 170L100 996M1023 168L1380 996" stroke="#a6b1a2" stroke-width="3"/>`;
for (let i=0;i<8;i++) {
  const t=i/7,y=200+800*t;
  svg+=`<path d="M${560-430*t} ${y}v-41M${1020+330*t} ${y}v-41" stroke="#7d8e82" stroke-width="4"/>`;
}
svg += `</g><g stroke="#8b9987" fill="none"><path d="M1080 270L1580 418" stroke-width="4"/>`;
for(let i=0;i<9;i++)svg+=`<path d="M${1080+i*62.5} ${270+i*18.5}v40" stroke-width="3"/>`;
svg+=`</g><path d="M1100 231V125" stroke="#243a37" stroke-width="5"/><path d="M1090 124h22" stroke="#ffedb4" stroke-width="4"/><ellipse cx="1100" cy="134" rx="60" ry="70" fill="url(#lamp)"/>
<path d="M1430 371V224" stroke="#213933" stroke-width="6"/><path d="M1417 224h25" stroke="#ffecb5" stroke-width="5"/><ellipse cx="1430" cy="245" rx="90" ry="110" fill="url(#lamp)"/>
<path d="M370 185L425 159 448 218 390 249Z" fill="#324d4d"/><text x="392" y="210" fill="#cad4b7" font-family="sans-serif" font-size="12" transform="rotate(-22 392 210)">EXIT ↘</text>`;
const visitors=[[637,320,.64,'#4e727e'],[704,342,.67,'#6d7973'],[859,314,.64,'#c1ac86'],[921,347,.68,'#87978b'],[594,466,.82,'#a9a48f'],[685,493,.86,'#455f65'],[843,484,.85,'#9c7770'],[944,507,.9,'#acb1a3'],[542,650,1.03,'#a4a893'],[665,690,1.1,'#536b73'],[845,650,1.04,'#566e71'],[989,720,1.15,'#939783'],[453,866,1.32,'#a77d73'],[618,918,1.4,'#9ba38e'],[819,862,1.32,'#9fa496'],[1017,935,1.44,'#6f8a95']];
for(const [x,y,s,c] of visitors){
 svg+=`<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="12" cy="-1" rx="20" ry="6" fill="#1b272b" opacity=".3" transform="rotate(-18)"/><path d="M-8-31L-11-6M8-32L13-8" stroke="#263c43" stroke-width="9" stroke-linecap="round"/><path d="M-12-6L-5-4M10-6L17-5" stroke="#a5b4ab" stroke-width="5" stroke-linecap="round"/><path d="M-10-60Q0-66 11-59L14-31Q0-24-15-32Z" fill="${c}"/><path d="M-12-55L-20-35M11-55L20-39" stroke="${c}" stroke-width="9" stroke-linecap="round"/><ellipse cx="0" cy="-70" rx="10" ry="11" fill="#b4a38b"/><path d="M-10-70Q-9-85 2-82Q13-81 11-68L5-70Z" fill="#283b3c"/><path d="M-7-58L6-54 7-31-7-33Z" fill="#192d33" opacity=".3"/></g>`;
}
svg+=`<rect width="1600" height="1000" fill="#263e49" opacity=".12"/></svg>`;
fs.writeFileSync(require('node:path').join(__dirname,'stadium-dusk.svg'),svg);
