/**
 * Convierte un número a letras en español (cardinal, minúsculas).
 * Soporta hasta miles de millones. Ignora decimales (redondea hacia abajo).
 * Uso en la hoja: =NUMEROLETRAS(F7)
 */
function NUMEROLETRAS(valor) {
  // Si viene con formato de texto/moneda, limpiamos y convertimos.
  if (typeof valor === 'string') {
    // Mantén signos y separadores, luego extrae número
    var limpio = valor.replace(/[^0-9,.\-]/g, '');
    // Normaliza: si hay ambas , y ., asume que el punto es decimal (estilo en-CL)
    if (/,/.test(limpio) && /\./.test(limpio)) {
      limpio = limpio.replace(/,/g, '');
    } else {
      // si solo hay coma, trátala como decimal
      limpio = limpio.replace(',', '.');
    }
    valor = parseFloat(limpio);
  }
  if (typeof valor !== 'number' || isNaN(valor)) return '';

  // Ignora decimales (si los hay)
  var n = Math.floor(valor);
  if (n === 0) return 'cero';
  var negativo = n < 0;
  if (negativo) n = Math.abs(n);

  // Palabras base
  var unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  var especiales10a29 = {
    10:'diez',11:'once',12:'doce',13:'trece',14:'catorce',15:'quince',
    16:'dieciséis',17:'diecisiete',18:'dieciocho',19:'diecinueve',
    20:'veinte',21:'veintiuno',22:'veintidós',23:'veintitrés',24:'veinticuatro',
    25:'veinticinco',26:'veintiséis',27:'veintisiete',28:'veintiocho',29:'veintinueve'
  };
  var decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  var centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

  function tripletaEnLetras(num) {
    // 0..999
    num = num % 1000;
    if (num === 0) return '';

    var c = Math.floor(num / 100);
    var d2 = num % 100;
    var d = Math.floor(d2 / 10);
    var u = d2 % 10;

    var partes = [];

    if (c === 1 && d2 === 0) {
      partes.push('cien');
    } else if (c > 0) {
      partes.push(centenas[c]);
    }

    if (d2 >= 10 && d2 <= 29) {
      partes.push(especiales10a29[d2]);
    } else {
      if (d >= 3) {
        if (u === 0) {
          partes.push(decenas[d]);
        } else {
          partes.push(decenas[d] + ' y ' + unidades[u]);
        }
      } else if (d === 2) {
        // 20 ya cubierto arriba, aquí solo cae 20 exacto (u==0) que ya tratamos
        if (u === 0) partes.push('veinte');
      } else if (d === 1) {
        // 10..19 ya cubierto arriba
        partes.push(especiales10a29[d2]);
      } else {
        if (u > 0) partes.push(unidades[u]);
      }
    }

    return partes.join(' ').trim();
  }

  function ajustaUnAntesDeEscala(texto) {
    // Reemplaza terminaciones "uno" -> "un" y "veintiuno" -> "veintiún" cuando van antes de "mil", "millón/millones", "mil millones"
    return texto
      .replace(/veintiuno$/,'veintiún')
      .replace(/uno$/,'un');
  }

  // Descomponer en grupos de 3: [mil millones][millones][miles][unidades]
  var milMillones = Math.floor(n / 1000000000); // 1.000.000.000
  var resto = n % 1000000000;
  var millones = Math.floor(resto / 1000000);
  resto = resto % 1000000;
  var miles = Math.floor(resto / 1000);
  var unidades999 = resto % 1000;

  var partes = [];

  // mil millones (thousands of millions)
  if (milMillones > 0) {
    if (milMillones === 1) {
      partes.push('mil millones');
    } else {
      var t = tripletaEnLetras(milMillones);
      t = ajustaUnAntesDeEscala(t);
      partes.push(t + ' mil millones');
    }
  }

  // millones
  if (millones > 0) {
    if (millones === 1) {
      partes.push('un millón');
    } else {
      var tm = tripletaEnLetras(millones);
      tm = ajustaUnAntesDeEscala(tm);
      partes.push(tm + ' millones');
    }
  }

  // miles
  if (miles > 0) {
    if (miles === 1) {
      partes.push('mil');
    } else {
      var tmi = tripletaEnLetras(miles);
      tmi = ajustaUnAntesDeEscala(tmi);
      partes.push(tmi + ' mil');
    }
  }

  // unidades finales
  if (unidades999 > 0) {
    partes.push(tripletaEnLetras(unidades999));
  }

  var texto = partes.join(' ').replace(/\s+/g, ' ').trim();
  if (negativo) texto = 'menos ' + texto;
  return texto;
}
