# Zapisnik za intervju

## 1. Najbitnije iz auth.ts – šta da zapišeš u svesku

### Šta je auth ruta uopšte?
- **auth.ts** = skup Express ruta za **registraciju i autentifikaciju** (ko korisnik jeste).
- Ruta se montira u `server.ts` kao `app.use('/api/auth', authRoutes)`, pa sve rute iz auth.ts imaju prefiks `/api/auth`.

### Tok registracije (korak po korak)

1. **Prima podatke iz tela zahteva**
   - `req.body` dolazi sa frontenda (JSON): `firstName`, `lastName`, `email`, `password`.
   - Bez `express.json()` u server.ts ne bi bilo `req.body`.

2. **Provera da li email već postoji**
   - `User.findOne({ email })` – Mongoose traži u MongoDB jednog korisnika sa tim emailom.
   - Ako postoji → vraćamo **400** i poruku da korisnik već postoji (ne kreiramo duplikat).

3. **Heširanje lozinke**
   - **Nikad ne čuvamo lozinku u čistom tekstu.**
   - `bcrypt.genSalt(10)` – generiše "so" (broj rundi = 10).
   - `bcrypt.hash(password, salt)` – od obične lozinke pravi nečitljiv heš. Iz heša se ne može vratiti originalna lozinka.
   - U bazi se čuva samo heš.

4. **Kreiranje i čuvanje korisnika**
   - `new User({ ... })` – kreiramo dokument po Mongoose šemi (User model).
   - `newUser.save()` – upis u MongoDB (async, pa `await`).

5. **JWT token**
   - JWT = "ulaznica" koju frontend čuva (npr. u localStorage) i šalje pri svakom zahtevu da dokaže ko je ulogovan.
   - `jwt.sign(payload, secret, options)`:
     - **payload** = šta stavljamo u token (npr. `{ id: newUser._id }`).
     - **secret** = iz `.env` (JWT_SECRET), da niko sa strane ne može da falsifikuje token.
     - **expiresIn** = token ističe npr. za 1h, posle toga nije validan.
   - Frontend dobija taj token i na Home / refresh šalje ga u headeru: `Authorization: Bearer <token>`.

6. **Odgovor frontendu**
   - **201** = uspešno kreiran resurs (korisnik).
   - U body šaljemo `token` i `user` (id, firstName, lastName, email – **bez** lozinke).

### Status kodovi koje koristiš
- **201** – uspeh, nešto kreirano (npr. novi korisnik).
- **400** – loš zahtev (npr. email već postoji).
- **500** – greška na serveru (npr. baza pala, catch blok).

### Zašto try/catch?
- Ako `User.save()` ili baza baci grešku, ne želimo da cela aplikacija padne. Uhvatimo grešku, logujemo je, vratimo klijentu **500** i generičku poruku.

### Validacija na backendu (registracija) – gde i kako
- **Gde:** U **auth.ts**, na ruti **POST /api/auth/register**, na samom početku – odmah posle `const { firstName, lastName, email, password } = req.body`, a **pre** bilo kakvog poziva baze.
- **Zašto na početku:** Da odbijemo loš zahtev što pre (fail fast), bez opterećivanja baze. Ako nešto nije validno, vratimo **400** i ne idemo u `User.findOne` ni `User.save`.
- **Šta proveravamo (zadatak):**
  - **First name / Last name:** obavezni – provera da postoje, da su string i da nisu prazni posle `trim()`.
  - **Email:** obavezan + **validan format** (regex: `nesto@domen.tld`).
  - **Password:** obavezan + **najmanje 6 karaktera**.
- **Kako:** Ručno – niz `errors: string[]`; za svako polje ako nije OK, `errors.push('poruka')`. Na kraju ako `errors.length > 0`, vraćamo `res.status(400).json({ message: 'Validation failed.', errors })`.
- **Posle validacije:** Koristimo **trim()** nad imenima i emailom pa te vrednosti šaljemo u bazu, da se ne čuvaju razmaci.

### Ruta GET /api/auth/me – zašto "me"?
- **"Me"** = "ja" na engleskom. Ruta odgovara na pitanje: **"Ko sam ja (trenutno ulogovan)?"** – ne šalješ id u URL, nego **dokaz** (JWT) u headeru; server iz tokena vidi ko si i vrati tvoje podatke.
- **Zašto se tako zove:** U API-jevima je uobičajeno da ruta za "trenutni korisnik" bude **/me** ili **/profile**. Npr. "daj mi **mene**" = GET /api/auth/me. Alternativa bi bila GET /api/auth/profile ili GET /api/users/current – "me" je kratko i jasno.
- **Kada se koristi:** Kad korisnik **osveži stranicu** (refresh). Frontend ima token u localStorage, pošalje ga u headeru `Authorization: Bearer <token>`, pozove GET /api/auth/me; ako je token validan, backend vrati user (firstName, lastName, email, id). Tako frontend zna ko je ulogovan i može da prikaže "Welcome {firstName} {lastName}" bez ponovnog logovanja.
- **Tok:** Header → izvadi token → `jwt.verify(token, secret)` → iz payload-a uzmeš `id` → `User.findById(id).select('-password')` → vratiš user. Ako nema header-a, token nevaljan ili istekao, ili user ne postoji → **401**.

---

## 2. Problem MongoDB + Linux (WSL) – šta te mučilo i kako da ispričaš

### Redosled: prvo MongoDB, pa prelazak na Linux

**Prvi veliki problem: nisi mogla da se povežeš na MongoDB**
- Na početku si radila verovatno na **Windowsu** (ili u okruženju gde ti baza nije radila). Pokušavala si da pokreneš backend i da se aplikacija poveže na MongoDB – bilo da je to bila **lokalna MongoDB na Windowsu** ili **remote baza** (npr. MongoDB Atlas).
- Povezivanje nije uspevalo: timeout, connection refused, ili neka druga greška. Bez uspešnog `mongoose.connect()` aplikacija nije mogla da radi (a u prvobitnom kodu je i server čekao tu konekciju pre nego što bi uopšte krenuo da sluša).
- **Zbog tog problema si prešla na Linux (WSL):** odlučila si da projekat prebaciš u WSL (Ubuntu), da imaš čisto Linux okruženje i da tamo probaš ponovo – ili da koristiš remote bazu iz Linuxa, ili da instaliraš MongoDB u WSL-u. Znači: problem sa MongoDB je bio **razlog** zašto si uopšte prešla na Linux.

**Kako da kažeš na intervjuu:**  
*"Na početku sam imala veliki problem da se uopšte povežem na MongoDB – bilo je timeout-ova ili connection refused, nisam uspevala da dobijem konekciju. Zbog toga sam odlučila da pređem na Linux, odnosno WSL. Prebacila sam projekat tamo da radim u Linux okruženju i da tamo rešim povezivanje na bazu."*

---

### Šta se dešavalo posle (već na Linuxu / WSL-u)
- Projekat je sada u **WSL (Ubuntu)**. Backend (Node + Express + Mongoose) treba da se pokrene u Linuxu i da se poveže na bazu.
- Sledeće stvari su pravile problem: **gde Node/npm rade** i **kako server sluša**.

### Problem 1: "WSL 1 is not supported" / "Could not determine Node.js install directory"
- **Šta je bilo:** Kada si pokretala `npm install` ili setup Node-a, izlazila su upozorenja da je "WSL 1" i da se ne može naći Node install direktorijum.
- **Zašto:** Često se desi kada **Node.js stoji na Windowsu**, a ti u Cursoru ili terminalu radiš sa **fajlovima koji su u WSL** (Linux path). U tom slučaju neki procesi pokreću **Windows-ov npm/Node**, koji očekuju Windows putanje i onda "ne vidi" pravu Linux instalaciju. Zato izgleda kao da je sve zbunjeno – kao da je WSL 1 ili kao da Node nije tu.
- **Šta si uradila / šta treba reći:** Instalirala si **Node.js unutar WSL-a** (npr. preko NodeSource ili nvm u Ubuntu terminalu), a ne oslanjala se na Windows Node. Tako `node` i `npm` budu na Linux path-u (npr. `/usr/bin/node` ili `~/.nvm/`), i sve radi konzistentno u istom okruženju gde je i projekat.

**Kako da kažeš na intervjuu:**  
*"Projekat mi je bio u WSL-u, a ja sam na početku možda imala Node na Windowsu. Kada sam radila npm install ili pokretala server, dobijala sam greške tipa da je WSL 1 ili da se ne može naći Node. Rešila sam tako što sam Node i npm instalirala direktno u WSL (Ubuntu), pa sve komande i server sada rade iz istog Linux okruženja gde je i projekat."*

### Problem 2: Server se nije pokretao / Connection refused na localhost:5000
- **Šta je bilo:** Posle pokretanja "dev servera" u browseru na `http://localhost:5000` dobijala si **Connection refused** (ERR_CONNECTION_REFUSED).
- **Zašto:** U originalnom kodu server je **prvo** pokretao `app.listen()` tek **unutar** `.then()` nakon uspešnog povezivanja na MongoDB. Ako MongoDB nije dostupan (remote baza blokirana firewallom, timeout, pogrešan MONGO_URI), `mongoose.connect()` nikad ne bi uspeo, pa `app.listen()` se **nikad ne bi ni pozvao** – dakle nijedan proces nije slušao na portu 5000.
- **Šta si uradila:** Promenila si logiku tako da se **server odmah pokrene** (`app.listen(PORT, '0.0.0.0')`), a povezivanje na MongoDB ide **u pozadini**. Tako aplikacija uvek sluša na portu, a ako baza nije dostupna, bar možeš da otvoriš stranicu i vidiš šta se dešava; rute koje koriste bazu će onda vratiti grešku dok se baza ne povuče.

**Kako da kažeš na intervjuu:**  
*"Na početku sam imala situaciju gde sam mislila da je server pokrenut, ali u browseru sam dobijala connection refused. Ispostavilo se da sam server (app.listen) pokretala tek nakon što se MongoDB uspešno poveže. Kad je baza bila nedostupna – npr. remote MongoDB zbog mreže – connect bi timeout-ovao i listen se nikad ne bi izvršio. Zato sam odvojila pokretanje servera od povezivanja na bazu: server sada uvek sluša na portu, a baza se povezuje u pozadini."*

### Problem 3: Pristup sa Windows browsera na server u WSL-u
- **Šta je bitno:** Ako backend radi **unutar WSL-a**, a ti u browseru na **Windowsu** otvaraš `http://localhost:5000`, WSL2 obično lepo prosleđuje localhost sa Windowsa na WSL. Ali da bi sve radilo pouzdano, server treba da sluša na **0.0.0.0** (sve mrežne interfejse), ne samo na 127.0.0.1. To si rešila kad si dodala `'0.0.0.0'` u `app.listen(PORT, '0.0.0.0')`.

**Kako da kažeš (opciono):**  
*"Kod je na početku slušao možda samo na localhost; pošto je backend u WSL, a ja koristim browser na Windowsu, osigurala sam da server sluša na 0.0.0.0 da bi pristup sa host mašine radio bez problema."*

---

## Rezime za brzo ponavljanje

**auth.ts:**
- Registracija = provera emaila → heš lozinke (bcrypt) → save user u MongoDB → JWT (payload: id, secret iz .env, expiresIn) → 201 + token + user (bez password).
- Nikad ne čuvati lozinku u čistom tekstu; koristiti bcrypt.
- JWT = način da frontend "dokaže" ko je ulogovan (šalje token u headeru).

**MongoDB + WSL (redosled priče):**
1. **Prvo:** Nisi mogla da se povežeš na MongoDB (na Windowsu / u starom okruženju) → zbog toga si **prešla na Linux (WSL)** da tamo rešiš povezivanje i radiš u Linux okruženju.
2. **Na WSL-u:** Node i npm moraju biti instalirani **u WSL-u** (ne na Windowsu), da ne bi bilo "WSL 1" / "install directory".
3. Server treba da se **pokrene nezavisno** od toga da li se MongoDB odmah poveže (listen odmah, connect u pozadini).
4. Za pristup sa Windowsa na server u WSL-u, slušati na **0.0.0.0**.
