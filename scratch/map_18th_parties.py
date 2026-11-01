import json
import re

# Load MoSPI 18th Lok Sabha MPs
with open('scratch/official_mospi_mappings.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

mps18 = d.get('18th_lok_sabha', [])

# Normalizer
def norm(s):
    if not s: return ""
    return re.sub(r'[^a-z0-9]', '', str(s).lower())

# Comprehensive accurate mapping for 18th Lok Sabha winners:
# Map by (state_norm, const_norm) -> (party, party_hi)
const_party_map = {}

def add(state, const, party, party_hi):
    const_party_map[(norm(state), norm(const))] = (party, party_hi)

# 1. Andaman & Nicobar
add("Andaman And Nicobar Islands", "ANDAMAN AND NICOBAR ISLANDS", "BJP", "भाजपा")

# 2. Andhra Pradesh (25)
# TDP: 16
for c in ["SRIKAKULAM", "VIZIANAGARAM", "VISAKHAPATNAM", "AMALAPURAM(SC)", "AMALAPURAM", "ELURU", "VIJAYAWADA", "GUNTUR", "NARASARAOPET", "BAPATLA(SC)", "BAPATLA", "ONGOLE", "NANDYAL", "KURNOOL", "ANANTAPUR", "HINDUPUR", "CHITTOOR(SC)", "CHITTOOR", "NELLORE"]:
    add("Andhra Pradesh", c, "TDP", "टीडीपी")
# YSRCP: 4
for c in ["ARAKU(ST)", "ARAKU", "KADAPA", "RAJAMPET", "TIRUPATI(SC)", "TIRUPATI"]:
    add("Andhra Pradesh", c, "YSRCP", "वाईएसआरसीपी")
# BJP: 3
for c in ["ANAKAPALLE", "RAJAHMUNDRY", "NARASAPURAM"]:
    add("Andhra Pradesh", c, "BJP", "भाजपा")
# JSP: 2
for c in ["KAKINADA", "MACHILIPATNAM"]:
    add("Andhra Pradesh", c, "JSP", "जनसेना पार्टी")

# 3. Arunachal Pradesh (2)
add("Arunachal Pradesh", "ARUNACHAL WEST", "BJP", "भाजपा")
add("Arunachal Pradesh", "ARUNACHAL EAST", "BJP", "भाजपा")

# 4. Assam (14)
# BJP: 9
for c in ["KAZIRANGA", "SONITPUR", "LAKHIMPUR", "DIBRUGARH", "GUWAHATI", "DIPHU (ST)", "DIPHU", "KARIMGANJ (SC)", "KARIMGANJ", "SILCHAR", "DARRANG-UDALGURI", "DARRANG UDALGURI"]:
    add("Assam", c, "BJP", "भाजपा")
# INC: 3
for c in ["DHUBRI", "NOWGONG", "JORHAT"]:
    add("Assam", c, "INC", "कांग्रेस")
# AGP: 1
add("Assam", "BARPETA", "AGP", "अगप")
# UPPL: 1
add("Assam", "KOKRAJHAR (ST)", "UPPL", "यूपीपीएल")
add("Assam", "KOKRAJHAR", "UPPL", "यूपीपीएल")

# 5. Bihar (40)
# BJP: 12
for c in ["PASCHIM CHAMPARAN", "WEST CHAMPARAN", "PURVI CHAMPARAN", "EAST CHAMPARAN", "MADHUBANI", "ARARIA", "DARBHANGA", "MUZAFFARPUR", "MAHARAJGANJ_BR", "MAHARAJGANJ", "SARAN", "UJJARPUR", "UJIARPUR", "BEGUSARAI", "PATNA SAHIB", "NAWADA"]:
    add("Bihar", c, "BJP", "भाजपा")
# JD(U): 12
for c in ["VALMIKI NAGAR", "SHEOHAR", "SITAMARHI", "JHANJHARPUR", "SUPAUL", "MADHEPURA", "GOPALGANJ (SC)", "GOPALGANJ", "SIWAN", "NALANDA", "MUNGER", "BANKA", "BHAGALPUR"]:
    add("Bihar", c, "JD(U)", "जद(यू)")
# LJP(RV): 5
for c in ["VAISHALI", "HAJIPUR(SC)", "HAJIPUR", "SAMASTIPUR(SC)", "SAMASTIPUR", "KHAGARIA", "JAMUI(SC)", "JAMUI"]:
    add("Bihar", c, "LJP(RV)", "लोजपा(रा)")
# HAM(S): 1
add("Bihar", "GAYA (SC)", "HAM(S)", "हम")
add("Bihar", "GAYA", "HAM(S)", "हम")
# RJD: 4
for c in ["PATALIPUTRA", "BUXAR", "JAHANABAD", "JEHANABAD", "AURANGABAD_BR", "AURANGABAD"]:
    add("Bihar", c, "RJD", "राजद")
# INC: 3
for c in ["KISHANGANJ", "KATIHAR", "SASARAM(SC)", "SASARAM"]:
    add("Bihar", c, "INC", "कांग्रेस")
# CPI(ML)L: 2
for c in ["ARRAH", "KARAKAT"]:
    add("Bihar", c, "CPI(ML)L", "भाकपा(माले)")
# IND: 1
add("Bihar", "PURNEA", "IND", "निर्दलीय")
add("Bihar", "PURNIA", "IND", "निर्दलीय")

# 6. Chandigarh (1)
add("Chandigarh", "CHANDIGARH", "INC", "कांग्रेस")

# 7. Chhattisgarh (11)
for c in ["SURGUJA(ST)", "SURGUJA", "RAIGARH(ST)", "RAIGARH", "JANJGIR CHAMPA(SC)", "JANJGIR-CHAMPA", "BILASPUR", "RAJNANDGAON", "DURG", "RAIPUR", "MAHASAMUND", "BASTAR(ST)", "BASTAR", "KANKER(ST)", "KANKER"]:
    add("Chhattisgarh", c, "BJP", "भाजपा")
add("Chhattisgarh", "KORBA", "INC", "कांग्रेस")

# 8. Delhi (7) - All BJP
for c in ["CHANDINI CHOWK", "CHANDNI CHOWK", "NORTH EAST DELHI", "EAST DELHI", "NEW DELHI", "NORTH WEST DELHI(SC)", "NORTH WEST DELHI", "WEST DELHI", "SOUTH DELHI"]:
    add("Delhi", c, "BJP", "भाजपा")

# 9. Goa (2)
add("Goa", "NORTH GOA", "BJP", "भाजपा")
add("Goa", "SOUTH GOA", "INC", "कांग्रेस")

# 10. Gujarat (26)
# INC: 1
add("Gujarat", "BANASKANTHA", "INC", "कांग्रेस")
# All other 25 BJP
for c in ["KACHCHH(SC)", "KACHCHH", "PATAN", "MAHESANA", "SABARKANTHA", "GANDHINAGAR", "AHMEDABAD EAST", "AHMEDABAD WEST(SC)", "AHMEDABAD WEST", "SURENDRANAGAR", "JAMNAGAR", "PORBANDAR", "ANAND", "KHEDA", "PANCHMAHAL", "DAHOD(ST)", "DAHOD", "VADODARA", "CHHOTA UDAIPUR(ST)", "CHHOTA UDAIPUR", "BHARUCH", "BARDOLI(ST)", "BARDOLI", "SURAT", "NAVSARI", "VALSAD(ST)", "VALSAD", "RAJKOT", "JUNAGADH", "AMRELI", "BHAVNAGAR"]:
    add("Gujarat", c, "BJP", "भाजपा")

# 11. Haryana (10)
for c in ["KURUKSHETRA", "KARNAL", "BHIWANI MAHENDRAGARH", "BHIWANI-MAHENDRAGARH", "GURGAON", "FARIDABAD"]:
    add("Haryana", c, "BJP", "भाजपा")
for c in ["AMBALA(SC)", "AMBALA", "SIRSA(SC)", "SIRSA", "HISAR", "SONEPAT", "SONIPAT", "ROHTAK"]:
    add("Haryana", c, "INC", "कांग्रेस")

# 12. Himachal Pradesh (4) - All BJP
for c in ["KANGRA", "MANDI", "HAMIRPUR_HP", "HAMIRPUR", "SHIMLA(SC)", "SHIMLA"]:
    add("Himachal Pradesh", c, "BJP", "भाजपा")

# 13. Jammu and Kashmir (5)
add("Jammu And Kashmir", "BARAMULLA", "IND", "निर्दलीय")
add("Jammu And Kashmir", "SRINAGAR", "JKNC", "नेकां")
add("Jammu And Kashmir", "ANANTNAG-RAJOURI", "JKNC", "नेकां")
add("Jammu And Kashmir", "ANANTNAG", "JKNC", "नेकां")
add("Jammu And Kashmir", "UDHAMPUR", "BJP", "भाजपा")
add("Jammu And Kashmir", "JAMMU", "BJP", "भाजपा")

# 14. Jharkhand (14)
for c in ["GODDA", "CHATRA", "KODERMA", "RANCHI", "JAMSHEDPUR", "DHANBAD", "PALAMU(SC)", "PALAMU", "HAZARIBAGH"]:
    add("Jharkhand", c, "BJP", "भाजपा")
for c in ["RAJMAHAL(ST)", "RAJMAHAL", "DUMKA(ST)", "DUMKA", "SINGHBHUM(ST)", "SINGHBHUM"]:
    add("Jharkhand", c, "JMM", "झामुमो")
for c in ["KHUNTI(ST)", "KHUNTI", "LOHARDAGA(ST)", "LOHARDAGA"]:
    add("Jharkhand", c, "INC", "कांग्रेस")
add("Jharkhand", "GIRIDIH", "AJSU", "आजसू")

# 15. Karnataka (28)
# BJP: 17
for c in ["BELGAUM", "BAGALKOT", "BIJAPUR(SC)", "BIJAPUR", "DHARWAD", "UTTARA KANNADA", "HAVERI", "SHIMOGA", "UDUPI CHIKMAGALUR", "DAKSHINA KANNADA", "CHITRADURGA(SC)", "CHITRADURGA", "TUMKUR", "MYSORE", "BANGALORE RURAL", "BANGALORE NORTH", "BANGALORE CENTRAL", "BANGALORE SOUTH"]:
    add("Karnataka", c, "BJP", "भाजपा")
# JD(S): 2
add("Karnataka", "MANDYA", "JD(S)", "जद(एस)")
add("Karnataka", "KOLAR(SC)", "JD(S)", "जद(एस)")
add("Karnataka", "KOLAR", "JD(S)", "जद(एस)")
# INC: 9
for c in ["CHIKKODI", "GULBARGA(SC)", "GULBARGA", "RAICHUR(ST)", "RAICHUR", "BIDAR", "KOPPAL", "BELLARY(ST)", "BELLARY", "DAVANAGERE", "HASSAN", "CHAMARAJANAGAR(SC)", "CHAMARAJANAGAR", "CHIKKABALLAPUR"]:
    add("Karnataka", c, "INC", "कांग्रेस")

# 16. Kerala (20)
for c in ["KASARAGOD", "KANNUR", "VADAKARA", "WAYANAD", "KOZHIKODE", "PALAKKAD", "ERNAKULAM", "IDUKKI", "CHALAKUDY", "ALAPPUZHA", "MAVELIKKARA(SC)", "MAVELIKKARA", "PATHANAMTHITTA", "ATTINGAL", "THIRUVANANTHAPURAM"]:
    add("Kerala", c, "INC", "कांग्रेस")
for c in ["MALAPPURAM", "PONNANI"]:
    add("Kerala", c, "IUML", "आईयूएमएल")
add("Kerala", "ALATHUR(SC)", "CPI(M)", "माकपा")
add("Kerala", "ALATHUR", "CPI(M)", "माकपा")
add("Kerala", "KOTTAYAM", "KEC(M)", "केरल कांग्रेस (एम)")
add("Kerala", "KOLLAM", "RSP", "आरएसपी")
add("Kerala", "THRISSUR", "BJP", "भाजपा")

# 17. Ladakh (1)
add("Ladakh", "LADAKH", "IND", "निर्दलीय")

# 18. Lakshadweep (1)
add("Lakshadweep", "LAKSHADWEEP(ST)", "INC", "कांग्रेस")
add("Lakshadweep", "LAKSHADWEEP", "INC", "कांग्रेस")

# 19. Madhya Pradesh (29) - All 29 BJP
for c in ["MORENA", "BHIND(SC)", "BHIND", "GWALIOR", "GUNA", "SAGAR", "TIKAMGARH(SC)", "TIKAMGARH", "DAMOH", "KHAJURAHO", "SATNA", "REWA", "SIDHI", "SHAHDOL(ST)", "SHAHDOL", "JABALPUR", "MANDLA(ST)", "MANDLA", "BALAGHAT", "CHHINDWARA", "HOSHANGABAD", "VIDISHA", "BHOPAL", "RAJGARH", "DEWAS(SC)", "DEWAS", "UJJAIN(SC)", "UJJAIN", "MANDSAUR", "RATLAM(ST)", "RATLAM", "DHAR(ST)", "DHAR", "INDORE", "KHARGONE(ST)", "KHARGONE", "KHANDWA", "BETUL(ST)", "BETUL"]:
    add("Madhya Pradesh", c, "BJP", "भाजपा")

# 20. Maharashtra (48)
# INC: 13
for c in ["NANDURBAR(ST)", "NANDURBAR", "DHULE", "AMRAVATI(SC)", "AMRAVATI", "BHANDARA-GONDIYA", "BHANDARA GONDIYA", "GADCHIROLI-CHIMUR(ST)", "GADCHIROLI - CHIMUR", "CHANDRAPUR", "NANDED", "JALNA", "MUMBAI NORTH CENTRAL", "KOLHAPUR", "RAMTEK(SC)", "RAMTEK", "SOLAPUR(SC)", "SOLAPUR"]:
    add("Maharashtra", c, "INC", "कांग्रेस")
# SS(UBT): 9
for c in ["PARBHANI", "NASHIK", "SHIRDI(SC)", "SHIRDI", "MUMBAI SOUTH", "MUMBAI SOUTH CENTRAL", "MUMBAI NORTH EAST", "OSMANABAD", "YAVATMAL-WASHIM", "YAVATMAL WASHIM", "HINGOLI"]:
    add("Maharashtra", c, "SHS(UBT)", "शिवसेना (यूबीटी)")
# NCP(SP): 8
for c in ["BARAMATI", "SHIRUR", "AHMEDNAGAR", "BEED", "DINDORI(ST)", "DINDORI", "MADHA", "WARDHA", "BHIWANDI"]:
    add("Maharashtra", c, "NCP-SP", "राकांपा (शप)")
# BJP: 9
for c in ["NAGPUR", "AKOLA", "JALGAON", "RAVER", "MUMBAI NORTH", "PALGHAR(ST)", "PALGHAR", "SATARA", "RATNAGIRI-SINDHUDURG", "PUNE"]:
    add("Maharashtra", c, "BJP", "भाजपा")
# SHS: 7
for c in ["KALYAN", "THANE", "MUMBAI NORTH WEST", "BULDHANA", "AURANGABAD_MH", "AURANGABAD", "MAVAL", "HATKANANGALE"]:
    add("Maharashtra", c, "SHS", "शिवसेना")
# NCP: 1
add("Maharashtra", "RAIGAD", "NCP", "राकांपा")
# IND: 1
add("Maharashtra", "SANGLI", "IND", "निर्दलीय")

# 21. Manipur (2)
add("Manipur", "INNER MANIPUR", "INC", "कांग्रेस")
add("Manipur", "OUTER MANIPUR(ST)", "INC", "कांग्रेस")
add("Manipur", "OUTER MANIPUR", "INC", "कांग्रेस")

# 22. Meghalaya (2)
add("Meghalaya", "SHILLONG(ST)", "VOTPP", "वीपीपी")
add("Meghalaya", "SHILLONG", "VOTPP", "वीपीपी")
add("Meghalaya", "TURA(ST)", "INC", "कांग्रेस")
add("Meghalaya", "TURA", "INC", "कांग्रेस")

# 23. Mizoram (1)
add("Mizoram", "MIZORAM(ST)", "ZPM", "जेडपीएम")
add("Mizoram", "MIZORAM", "ZPM", "जेडपीएम")

# 24. Nagaland (1)
add("Nagaland", "NAGALAND", "INC", "कांग्रेस")

# 25. Odisha (21)
for c in ["BARGARH", "SUNDARGARH(ST)", "SUNDARGARH", "SAMBALPUR", "KEONJHAR(ST)", "KEONJHAR", "MAYURBHANJ(ST)", "MAYURBHANJ", "BALASORE", "BHADRAK(SC)", "BHADRAK", "JAJPUR(SC)", "JAJPUR", "DHENKANAL", "BOLANGIR", "KALAHANDI", "NABARANGPUR(ST)", "NABARANGPUR", "KENDRAPARA", "JAGATSINGHPUR(SC)", "JAGATSINGHPUR", "CUTTACK", "PURI", "BHUBANESWAR", "ASKA", "BERHAMPUR", "KANDHAMAL"]:
    add("Odisha", c, "BJP", "भाजपा")
add("Odisha", "KORAPUT(ST)", "INC", "कांग्रेस")
add("Odisha", "KORAPUT", "INC", "कांग्रेस")

# 26. Puducherry (1)
add("Puducherry", "PUDUCHERRY", "INC", "कांग्रेस")

# 27. Punjab (13)
for c in ["GURDASPUR", "AMRITSAR", "JALANDHAR(SC)", "JALANDHAR", "LUDHIANA", "FATEHGARH SAHIB(SC)", "FATEHGARH SAHIB", "FIROZPUR", "PATIALA"]:
    add("Punjab", c, "INC", "कांग्रेस")
for c in ["HOSHIARPUR(SC)", "HOSHIARPUR", "ANANDPUR SAHIB", "SANGRUR"]:
    add("Punjab", c, "AAP", "आप")
add("Punjab", "BATHINDA", "SAD", "शिअद")
for c in ["KHADOOR SAHIB", "FARIDKOT(SC)", "FARIDKOT"]:
    add("Punjab", c, "IND", "निर्दलीय")

# 28. Rajasthan (25)
for c in ["BIKANER(SC)", "BIKANER", "JAIPUR", "ALWAR", "AJMER", "PALI", "JODHPUR", "JALORE", "UDAIPUR(ST)", "UDAIPUR", "CHITTORGARH", "RAJSAMAND", "BHILWARA", "KOTA", "JHALAWAR-BARAN", "JAIPUR RURAL"]:
    add("Rajasthan", c, "BJP", "भाजपा")
for c in ["GANGANAGAR(SC)", "GANGANAGAR", "CHURU", "JHUNJHUNU", "BHARATPUR(SC)", "BHARATPUR", "KARAULI-DHOLPUR(SC)", "KARAULI-DHOLPUR", "DAUSA(ST)", "DAUSA", "TONK-SAWAI MADHOPUR", "BARMER"]:
    add("Rajasthan", c, "INC", "कांग्रेस")
add("Rajasthan", "SIKAR", "CPI(M)", "माकपा")
add("Rajasthan", "NAGAUR", "RLP", "रालोपा")
add("Rajasthan", "BANSWARA(ST)", "BAP", "बीएपी")
add("Rajasthan", "BANSWARA", "BAP", "बीएपी")

# 29. Sikkim (1)
add("Sikkim", "SIKKIM", "SKM", "एसकेएम")

# 30. Tamil Nadu (39)
# DMK: 22
for c in ["CHENNAI NORTH", "CHENNAI SOUTH", "CHENNAI CENTRAL", "SRIPERUMBUDUR", "KANCHEEPURAM(SC)", "KANCHEEPURAM", "ARAKKONAM", "VELLORE", "DHARMAPURI", "TIRUVANNAMALAI", "ARANI", "KALLAKURICHI", "SALEM", "ERODE", "NILGIRIS(SC)", "NILGIRIS", "COIMBATORE", "POLLACHI", "PERAMBALUR", "THANJAVUR", "THENI", "THOOTHUKKUDI", "THOOTHUKUDI", "TENKASI(SC)", "TENKASI"]:
    add("Tamil Nadu", c, "DMK", "द्रमुक")
# INC: 9
for c in ["TIRUVALLUR(SC)", "TIRUVALLUR", "KRISHNAGIRI", "KARUR", "CUDDALORE", "MAYILADUTHURAI", "SIVAGANGA", "VIRUDHUNAGAR", "TIRUNELVELI", "KANNIYAKUMARI"]:
    add("Tamil Nadu", c, "INC", "कांग्रेस")
# CPI: 2
for c in ["TIRUPPUR", "NAGAPATTINAM(SC)", "NAGAPATTINAM"]:
    add("Tamil Nadu", c, "CPI", "भाकपा")
# CPI(M): 2
for c in ["MADURAI", "DINDIGUL"]:
    add("Tamil Nadu", c, "CPI(M)", "माकपा")
# VCK: 2
for c in ["CHIDAMBARAM(SC)", "CHIDAMBARAM", "VILUPPURAM(SC)", "VILUPPURAM"]:
    add("Tamil Nadu", c, "VCK", "वीसीके")
# MDMK: 1
add("Tamil Nadu", "TIRUCHIRAPPALLI", "MDMK", "एमडीएमके")
# IUML: 1
add("Tamil Nadu", "RAMANATHAPURAM", "IUML", "आईयूएमएल")

# 31. Telangana (17)
for c in ["ADILABAD(ST)", "ADILABAD", "KARIMNAGAR", "NIZAMABAD", "MALKAJGIRI", "SECUNDERABAD", "CHEVALLA", "MAHABUBNAGAR", "MEDAK"]:
    add("Telangana", c, "BJP", "भाजपा")
for c in ["PEDDAPALLE(SC)", "PEDDAPALLE", "ZAHIRABAD", "BHONGIR", "WARANGEL(SC)", "WARANGAL(SC)", "WARANGAL", "MAHABUBABAD(ST)", "MAHABUBABAD", "NALGONDA", "NAGARKURNOOL(SC)", "NAGARKURNOOL", "KHAMMAM"]:
    add("Telangana", c, "INC", "कांग्रेस")
add("Telangana", "HYDERABAD", "AIMIM", "एआईएमआईएम")

# 32. UTs
add("The Dadra And Nagar Haveli And Daman And Diu", "DADRA & NAGAR HAVELI (ST)", "BJP", "भाजपा")
add("The Dadra And Nagar Haveli And Daman And Diu", "DAMAN & DIU", "IND", "निर्दलीय")
add("Tripura", "TRIPURA WEST", "BJP", "भाजपा")
add("Tripura", "TRIPURA EAST(ST)", "BJP", "भाजपा")
add("Tripura", "TRIPURA EAST", "BJP", "भाजपा")

# 33. Uttar Pradesh (80)
# SP: 37
for c in ["KAIRANA", "MUZAFFARNAGAR", "MORADABAD", "RAMPUR", "SAMBHAL", "FIROZABAD", "MAINPURI", "ETAH", "BADAUN", "AONLA", "MOHANLALGANJ(SC)", "MOHANLALGANJ", "KANNAUJ", "FAIZABAD", "AMBEDKAR NAGAR", "AZAMGARH", "LALGANJ(SC)", "LALGANJ", "GHOSI", "SALEMPUR", "BALLIA", "JAUNPUR", "MACHHLISHAHR(SC)", "MACHHLISHAHR", "GHAZIPUR", "CHANDAULI", "KAUSHAMBI(SC)", "KAUSHAMBI", "BANDA", "FATEHPUR", "DHAURAHRA", "KHERI", "PRATAPGARH", "SULTANPUR", "BASTI", "SANT KABIR NAGAR", "ROBERTSGANJ(SC)", "ROBERTSGANJ", "SHRAWASTI", "JALAUN(SC)", "JALAUN"]:
    add("Uttar Pradesh", c, "SP", "सपा")
# BJP: 33
for c in ["VARANASI", "LUCKNOW", "GORAKHPUR", "MATHURA", "MEERUT", "GHAZIABAD", "GAUTAM BUDDHA NAGAR", "BULANDSHAHR(SC)", "BULANDSHAHR", "ALIGARH", "AGRA(SC)", "AGRA", "FATEHPUR SIKRI", "BAREILLY", "PILIBHIT", "SHAHJAHANPUR(SC)", "SHAHJAHANPUR", "HARDOI(SC)", "HARDOI", "MISRIKH(SC)", "MISRIKH", "UNNAO", "KANPUR", "AKBARPUR", "JHANSI", "HAMIRPUR_UP", "HAMIRPUR", "PHULPUR", "DOMARIYAGANJ", "MAHARAJGANJ_UP", "MAHARAJGANJ", "KUSHINAGAR", "DEORIA", "BANSGAON(SC)", "BANSGAON", "BHADOHI", "HATHRAS(SC)", "HATHRAS", "FARRUKHABAD", "KAISERGANJ", "GONDA"]:
    add("Uttar Pradesh", c, "BJP", "भाजपा")
# INC: 6
for c in ["SAHARANPUR", "AMETHI", "RAE BARELI", "ALLAHABAD", "BARABANKI(SC)", "BARABANKI", "SITAPUR"]:
    add("Uttar Pradesh", c, "INC", "कांग्रेस")
# RLD: 2
for c in ["BIJNOR", "BAGHPAT"]:
    add("Uttar Pradesh", c, "RLD", "रालोद")
# ASP(KR): 1
add("Uttar Pradesh", "NAGINA(SC)", "ASP(KR)", "आसपा (कांशीराम)")
add("Uttar Pradesh", "NAGINA", "ASP(KR)", "आसपा (कांशीराम)")
# AD(S): 1
add("Uttar Pradesh", "MIRZAPUR", "AD(S)", "अपना दल (सो)")

# 34. Uttarakhand (5) - All BJP
for c in ["TEHRI GARHWAL", "GARHWAL", "ALMORA(SC)", "ALMORA", "NAINITAL-UDHAMSINGH NAGAR", "HARIDWAR"]:
    add("Uttarakhand", c, "BJP", "भाजपा")

# 35. West Bengal (42)
# TMC: 29
for c in ["COOCH BEHAR(SC)", "COOCH BEHAR", "JANGIPUR", "BAHARAMPUR", "MURSHIDABAD", "KRISHNANAGAR", "BARRACKPUR", "BARRACKPORE", "DUM DUM", "BARASAT", "BASIRHAT", "JOYNAGAR(SC)", "JOYNAGAR", "MATHURAPUR(SC)", "MATHURAPUR", "DIAMOND HARBOUR", "JADAVPUR", "KOLKATA DAKSHIN", "KOLKATA UTTAR", "HOWRAH", "ULUBERIA", "SREERAMPUR", "HOOGHLY", "ARAMBAGH(SC)", "ARAMBAGH", "GHATAL", "JHARGRAM(ST)", "JHARGRAM", "MEDINIPUR", "BANKURA", "BARDHAMAN PURBA(SC)", "BARDHAMAN PURBA", "BARDHAMAN-DURGAPUR", "BARDHAMAN DURGAPUR", "ASANSOL", "BOLPUR(SC)", "BOLPUR", "BIRBHUM"]:
    add("West Bengal", c, "TMC", "तृणमूल कांग्रेस")
# BJP: 12
for c in ["DARJEELING", "JALPAIGURI(SC)", "JALPAIGURI", "ALIPURDUARS(ST)", "ALIPURDUARS", "BALURGHAT", "MALDAHA UTTAR", "RANAGHAT(SC)", "RANAGHAT", "BANGAON(SC)", "BANGAON", "KANTHI", "TAMLUK", "PURULIA", "BISHNUPUR(SC)", "BISHNUPUR", "RAIGANJ"]:
    add("West Bengal", c, "BJP", "भाजपा")
# INC: 1
add("West Bengal", "MALDAHA DAKSHIN", "INC", "कांग्रेस")

# Test match count
matched = 0
unmatched = []
for m in mps18:
    st_norm = norm(m['state_name'])
    cn_norm = norm(m['const_name'])
    key = (st_norm, cn_norm)
    if key in const_party_map:
        matched += 1
    else:
        unmatched.append(m)

print(f"Matched {matched} out of {len(mps18)} MoSPI 18th LS MPs!")
if unmatched:
    print(f"Unmatched {len(unmatched)}:")
    for u in unmatched[:15]:
        print(f"  {u['state_name']} | {u['const_name']} | {u['mp_name']}")
