// Переменные всяких элементов из HTML
const generationMethod = document.querySelector('#methods');
const generateButton = document.querySelector('#generate');
const clearButton = document.querySelector('#clear');
const generationCount = document.querySelector('#generationCount');
const generatorOptionQ = document.querySelector('#q');
const generatorOptionM = document.querySelector('#m');
const generatorOptionAlpha = document.querySelector('#alpha');
const generatorOptionDescret = document.querySelector('#descret');
const valuesBar = document.querySelector('#values');
const calculatedColumn = document.querySelector('#secondColumn');

// Переменные для построения графиков: values -  массив со значениями Х из выборки, остальные два нужны для построения дискретного метода
let values = [];
let Xi = [];
let Pi = [];

// Переменные 4х графиков и массива в котором будут храниться значения всех чисел и их повторений
let root; 
let root2;
let root3;
let root4;
let numbersCount;

// Обработчик кнопки генерации
generateButton.addEventListener('click', () => {
   if (generationMethod.value !== "" && generationCount.value !== "") {
      generatorOptionDescret.style.display = "flex";
      valuesBar.innerHTML = ``;
      generatorOptionDescret.innerHTML = ``;
      calculatedColumn.innerHTML = ``;
      values = [];
      let descretTemp = [];
      let newValue;
      let q,m,lambda;
      switch (generationMethod.value) {
         case "1.1 Бернулли":
            q = parseFloat(generatorOptionQ.value);
            if (typeof q !== "number" || q < 0 || q > 1 || generatorOptionQ.value == "") {
               alert ("Q должно быть числом от 0 до 1");
               throw new Error ("Q должно быть числом от 0 до 1");
            }

            for (let i = 0; i < generationCount.value; i++) {
               newValue = bernoulli(q);
               values.push(newValue);
            }
            break;

         case "1.2 Биномиальное":
            q = parseFloat(generatorOptionQ.value);
            m = parseFloat(generatorOptionM.value);
            if (typeof q !== "number" || q < 0 || q > 1 || generatorOptionQ.value == "") {
               alert ("Q должно быть числом от 0 до 1");
               throw new Error ("Q должно быть числом от 0 до 1");
            }
            if (typeof m !== "number" || m < 0 || generatorOptionM.value == "") {
               alert ("M должно быть числом больше 0");
               throw new Error ("M должно быть числом больше 0");
            }

            for (let i = 0; i < generationCount.value; i++) {
               newValue = binomial(m, q);
               values.push(newValue);
            }
            break;

         case "1.3 Пуассона":
            lambda = parseFloat(generatorOptionAlpha.value);
            if (typeof lambda !== "number" || lambda < 0 || generatorOptionAlpha.value == "") {
               alert ("Lamda должно быть числом больше 0");
               throw new Error ("Lamda должно быть числом больше 0");
            }
            for (let i = 0; i < generationCount.value; i++) {
               newValue = poisson(lambda);
               values.push(newValue);
            }
            break;

         case "1.4 Дискретное":
            for (let i = 0; i < 10; ++i) {
               descretTemp.push( myRandom(1, 10) );
            }

            let sum = descretTemp.reduce(function(a, b){
               return a + b;
            }, 0);

            const valueRow = document.createElement('div');
               valueRow.innerHTML = `
                  <h5>Xi</h5>
                  <h5>Pi</h5>
               `;
               generatorOptionDescret.appendChild(valueRow);

            for (let i = 0; i < 10; ++i) {                 
               Xi.push( myRandom(1, 40) );
               Pi.push( parseFloat((descretTemp[i] / sum ).toFixed(3)) );

               const valueRow = document.createElement('div');
               valueRow.innerHTML = `
                  <h5>${ Xi[i] }</h5>
                  <h5>${ Pi[i] }</h5>
               `;
               generatorOptionDescret.appendChild(valueRow);
            }
            for (let i = 0; i < generationCount.value; i++) {
               newValue = discrete(Xi, Pi);
               values.push ( newValue );
            }
            break;
      }
   
      for (let i = 0; i < values.length; i++) {
         const valueRow = document.createElement('div');
         valueRow.classList.add("valueRow");
         valueRow.innerHTML = `
            <h5>${ i + 1 }</h5>
            <h5>${ values[i] }</h5>
         `;
         valuesBar.appendChild(valueRow);
      }

      numbersCount = countOccurrences(values);
      graph1Creator();
      graph2Creator();
      graph3Creator();
      graph4Creator();
      calculateStatistics(values);
      
   } else {
      alert("Значения настроек не могут быть пустыми");
      throw new Error ("Значения настроек не могут быть пустыми");
   }
})


//----------------------------------------------------------------------------------Дальше будут функции разных методов генерации


// Функция, которая возвращает биномиально распределенное случайное число
// n - количество испытаний, q - вероятность успеха
function binomial(n, q) {
   let k = 0;
   // Повторяем n раз
   for (let i = 0; i < n; i++) {
      // Генерируем случайное число от 0 до 1
      let r = Math.random();
      // Если число меньше или равно p, то считаем это успехом и увеличиваем счетчик
      if (r <= q) {
         k++;
      }
   }
   // Возвращаем счетчик успехов
   return k;
}

// Функция, которая возвращает биномиальный коэффициент
// n - количество испытаний, k - количество успехов
function binomialCoefficient(n, k) {
   // Возвращаем отношение факториалов n, k и n-k
   return factorial(n) / (factorial(k) * factorial(n - k));
}

// Функция, которая возвращает биномиальную вероятность
// n - количество испытаний, p - вероятность успеха, k - количество успехов
function binomialProbability(n, p, k) {
   // Возвращаем произведение биномиального коэффициента и степеней p и 1-p
   return binomialCoefficient(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

// Фунция генерации чисел для выборки методом Бернулли
function bernoulli (q) {
   // Генерируем случайное число от 0 до 1
   let random = Math.random ();
   // Сравниваем его с q и возвращаем результат
   return random <= q ? 1 : 0;
}

// Функция, которая возвращает пуассоновски распределенное случайное число
// lambda - интенсивность события
function poisson(lambda) {
   // Инициализируем k и u
   let k = 0;
   let u = Math.random();
   // Инициализируем F(k) и F(k-1)
   let F = Math.exp(-lambda); // F(0)
   let F_prev = 0; // F(-1)
   // Пока не найдем подходящее k
   while (u > F) {
      // Увеличиваем k на 1
      k++;
      // Обновляем F(k-1) и F(k)
      F_prev = F;
      F = F + Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
   }
   // Возвращаем k
   return k;
}

// Функция, которая возвращает Пуассоновскую вероятность
// k - количество событий, lambda - интенсивность события, n - количество испытаний
function poissonProbability(k, lambda) {
   // Возвращаем произведение степени lambda n, факториала k и экспоненты отрицательного lambda n
   return Math.pow(lambda, k) / factorial(k) * Math.exp(-lambda);
}

// Функция, которая возвращает дискретно распределенное случайное число
// X - массив возможных значений, P - массив соответствующих вероятностей
function discrete(X, P) {
   // Проверяем, что массивы X и P имеют одинаковую длину и не пустые
   if (X.length !== P.length || X.length === 0) {
      return null; // Возвращаем null в случае ошибки
   }
   // Суммируем все вероятности из P
   let sum = 0;
   for (let p of P) {
      sum += p;
   }
   // Генерируем случайное число от 0 до суммы вероятностей
   let random = Math.random() * sum;
   // Ищем интервал, в который попадает случайное число
   let index = 0; // Индекс элемента из X, который будет возвращен
   let acc = 0; // Накопленная сумма вероятностей
   for (let i = 0; i < P.length; i++) {
      acc += P[i]; // Добавляем вероятность текущего элемента
      if (random < acc) {
         // Если случайное число меньше накопленной суммы, то мы нашли интервал
         index = i; // Запоминаем индекс элемента
         break; // Прерываем цикл
      }
   }
   // Возвращаем элемент из X по найденному индексу
   return X[index];
}


//----------------------------------------------------------------------------------Дальше будут функции построения графиков


// Построение 1го графика (левый верхний)
function graph1Creator() {
   // Define data
   let data = [];
   let yAxis;
   let xAxis;
   let chart;

   if (root) {
      root.dispose();
   }
   root = am5.Root.new("graph1");
   root.setThemes([
      am5themes_Animated.new(root)
   ]);

   chart = root.container.children.push( 
      am5xy.XYChart.new(root, {
         panY: false,
         wheelY: "zoomX",
      }) 
   );

   // Формирование данных для построения графика
   for (let i = 0; i < values.length; ++i) {
      data.push({
         K: i + 1,
         X: values[i]
      });
   }

   // Create Y-axis
   yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
         strictMinMax: true,
         maxPrecision: 0,
         renderer: am5xy.AxisRendererY.new(root, {})
      })
   );

   // Create X-Axis
   xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
         min: 1,
         max: parseInt(generationCount.value),
         renderer: am5xy.AxisRendererX.new(root, {})
      })
   );

   var series = chart.series.push( 
      am5xy.LineSeries.new(root, { 
         name: "Series",
         xAxis: xAxis, 
         yAxis: yAxis, 
         valueYField: "X", 
         valueXField: "K",
         maskBullets: false
      }) 
   );

   series.bullets.push(function() {
      return am5.Bullet.new(root, {
         sprite: am5.Circle.new(root, {
            radius: 5,
            fill: series.get("fill")
         })
      });
   });

   series.strokes.template.set("strokeWidth", 2);
   series.set("fill", am5.color(0xff8C00));
   series.set("stroke", am5.color(0xFFD700));
   series.data.setAll(data);
}

// Построение 2го графика (правый верхний)
function graph2Creator() {
   // Define data
   let data = [];
   let yAxis;
   let xAxis;
   let chart;

   if (root2) {
      root2.dispose();
   }
   root2 = am5.Root.new("graph2");
   root2.setThemes([
      am5themes_Animated.new(root2)
   ]);

   chart = root2.container.children.push( 
      am5xy.XYChart.new(root2, {
         panY: false,
         wheelY: "zoomX",
         layout: root.verticalLayout
      }) 
   );
   
   // Формирование данных для построения графика
   for (key in numbersCount) {
      data.push({
         "number": parseInt(key),
         "value": numbersCount[key]
      });
   }

   // Create Y-axis
   yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root2, {
         extraMax: 0.1,
         maxPrecision: 0,
         logarithmic: true,
         renderer: am5xy.AxisRendererY.new(root2, {})
      })
   );

   xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root2, {
         categoryField: "number",
         renderer: am5xy.AxisRendererX.new(root2, {})
      })
   );

   xAxis.data.setAll(data);

   var series = chart.series.push( 
      am5xy.ColumnSeries.new(root2, { 
         name: "Series",
         xAxis: xAxis, 
         yAxis: yAxis, 
         valueYField: "value", 
         categoryXField: "number",
         tooltip: am5.Tooltip.new(root2, {
            labelText: "'{categoryX}' = {valueY}"
         })
      }) 
   );

   series.columns.template.setAll({
      width: am5.percent(60)
   });
   
   chart.set("cursor", am5xy.XYCursor.new(root2, {}));

   let cursor = chart.get("cursor");
   cursor.lineY.setAll({
      visible: false
   });
   cursor.lineX.setAll({
      visible: false
   });

   series.data.setAll(data);
   series.set("fill", am5.color(0xff8C00));
   series.set("stroke", am5.color(0xff8C00));
}

// Построение 3го графика (левый нижний)
function graph3Creator() {
   // Define data
   let data = [];
   let yAxis;
   let xAxis;
   let chart;
   let teorValue;
   let otnValue;

   if (root3) {
      root3.dispose();
   }
   root3 = am5.Root.new("graph3");
   root3.setThemes([
      am5themes_Animated.new(root3)
   ]);

   chart = root3.container.children.push( 
      am5xy.XYChart.new(root3, {
         panY: false,
         wheelY: "zoomX",
         layout: root.verticalLayout
      }) 
   );

   // Формирование данных для построения графика
   switch (generationMethod.value) {
      case "1.1 Бернулли":
         for (key in numbersCount) {
            otnValue = numbersCount[key] / parseInt(generationCount.value);
            if (parseInt(key) == 1) {
               teorValue = parseFloat(generatorOptionQ.value);
            } else {
               teorValue = 1 - parseFloat(generatorOptionQ.value);
            }
            data.push({
               "number": parseInt(key),
               "otnValue": otnValue,
               "teorValue": teorValue
            });
         }
         break;

      case "1.2 Биномиальное":
         for (key in numbersCount) {
            otnValue = numbersCount[key] / parseInt(generationCount.value);
            teorValue = binomialProbability( parseFloat( generatorOptionM.value), parseFloat( generatorOptionQ.value), parseInt(key) );
            data.push({
               "number": parseInt(key),
               "otnValue": otnValue,
               "teorValue": teorValue
            });
         }
         break;

      case "1.3 Пуассона":
         for (key in numbersCount) {
            otnValue = numbersCount[key] / parseInt(generationCount.value);
            teorValue = poissonProbability( parseInt(key), parseFloat(generatorOptionAlpha.value) );
            data.push({
               "number": parseInt(key),
               "otnValue": otnValue,
               "teorValue": teorValue
            });
         }
         break;

      case "1.4 Дискретное":
         for (key in numbersCount) {
            otnValue = numbersCount[key] / parseInt(generationCount.value);
            let index = Xi.indexOf( parseInt(key) );
            teorValue = Pi[index];
            data.push({
               "number": parseInt(key),
               "otnValue": otnValue,
               "teorValue": teorValue
            });
         }
         break;
      }

   // Create Y-axis
   yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root3, {
         strictMinMax: true,
         renderer: am5xy.AxisRendererY.new(root3, {})
      })
   );

   // Create X-axis
   xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root3, {
         minGridDistance: 1,
         renderer: am5xy.AxisRendererX.new(root3, {
            cellStartLocation: 0.1,
            cellEndLocation: 0.6
         }),
         categoryField: "number"
      })
   );

   xAxis.data.setAll(data);

   var series = chart.series.push( 
      am5xy.ColumnSeries.new(root3, { 
         name: "Series",
         xAxis: xAxis, 
         yAxis: yAxis, 
         valueYField: "otnValue", 
         categoryXField: "number",
         tooltip: am5.Tooltip.new(root3, {
            labelText: "отн.для {categoryX}={valueY}"
         })
      }) 
   );

   var series2 = chart.series.push( 
      am5xy.ColumnSeries.new(root3, { 
         name: "Series",
         xAxis: xAxis, 
         yAxis: yAxis, 
         valueYField: "teorValue", 
         categoryXField: "number",
         tooltip: am5.Tooltip.new(root3, {
            labelText: "теор.для {categoryX}={valueY}"
         })
      }) 
   );

   series.columns.template.setAll({
      width: am5.percent(90)
   });
   series2.columns.template.setAll({
      width: am5.percent(90)
   });
   
   chart.set("cursor", am5xy.XYCursor.new(root3, {}));

   let cursor = chart.get("cursor");
   cursor.lineY.setAll({
      visible: false
   });
   cursor.lineX.setAll({
      visible: false
   });

   series.data.setAll(data);
   series2.data.setAll(data);
   series.set("fill", am5.color(0xff8C00));
   series.set("stroke", am5.color(0xff8C00));
}

// Построение 4го графика (правый нижний)
function graph4Creator() {
   // Define data
   let data = [];
   let yAxis;
   let xAxis;
   let chart;
   let otnValue;
   let lastValue = 0;

   if (root4) {
      root4.dispose();
   }
   root4 = am5.Root.new("graph4");
   root4.setThemes([
      am5themes_Animated.new(root4)
   ]);

   chart = root4.container.children.push( 
      am5xy.XYChart.new(root4, {
         panY: false,
         wheelY: "zoomX",
      }) 
   );

   // Формирование данных для построения графика
   for (key in numbersCount) {
      otnValue = numbersCount[key] / parseInt(generationCount.value) + lastValue;
      lastValue = otnValue;
      data.push({
         "number": parseInt(key),
         "Fx": otnValue
      });
   }

   // Create Y-axis
   yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root4, {
         strictMinMax: true,
         extraMax: 0.1,
         renderer: am5xy.AxisRendererY.new(root4, {})
      })
   );

   // Create X-Axis
   xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root4, {
         strictMinMax: true,
         maxPrecision: 0,
         renderer: am5xy.AxisRendererX.new(root4, {})
      })
   );

   var series = chart.series.push( 
      am5xy.SmoothedXLineSeries.new(root4, { 
         name: "Series",
         xAxis: xAxis, 
         yAxis: yAxis, 
         valueYField: "Fx", 
         valueXField: "number",
         maskBullets: false,
         tooltip: am5.Tooltip.new(root4, {
            labelText: "{valueY}"
         })
      }) 
   );

   series.bullets.push(function() {
      return am5.Bullet.new(root4, {
         sprite: am5.Circle.new(root4, {
            radius: 5,
            fill: series.get("fill")
         })
      });
   });
   
   series.get("tooltip").label.set("text", "{valueY}")
   chart.set("cursor", am5xy.XYCursor.new(root4, {
      behavior: "zoomXY",
      xAxis: xAxis
   }));
   yAxis.set("tooltip", am5.Tooltip.new(root4, {
      themeTags: ["axis"]
   }));

   series.strokes.template.set("strokeWidth", 2);
   series.data.setAll(data);
   series.set("fill", am5.color(0xff8C00));
   series.set("stroke", am5.color(0xFFD700));
}


//----------------------------------------------------------------------------------Дальше будут просто вспомогательные функции


// Функция подсчета повторяющегося значения в массиве
function countOccurrences(arr) {
   return arr.reduce((acc, curr) => {
      acc[curr] ? acc[curr]++ : (acc[curr] = 1);
      return acc;
   }, {});
}

// Функция очистки всех полей настроек и удаления графиков
function clear() {
   generationMethod.selectedIndex = 0;
   generatorOptionQ.value = "";
   generatorOptionM.value = "";
   generatorOptionAlpha.value = "";
   generationCount.value = "100";
   if (root) {
      root.dispose();
      root2.dispose();
      root3.dispose();
      root4.dispose();
   }
}

      // Функция, которая получает на вход массив и может посчитать мат.ожидание, среднеквадратичное отклонение, дисперсию, Ассиметрию и эксцесс
function calculateStatistics(arr) {
   const n = arr.length;
   const mean = arr.reduce((acc, val) => acc + val, 0) / n;
   const variance = arr.reduce((acc, val) => acc + (val - mean) ** 2, 0) / n;
   const stdDev = Math.sqrt(variance);
   const skewness = arr.reduce((acc, val) => acc + ((val - mean) / stdDev) ** 3, 0) / n;
   const excess = arr.reduce((acc, val) => acc + ((val - mean) / stdDev) ** 4, 0) / n - 3;

   for (let i = 0; i < 5; i++) {
      const calculatedRow = document.createElement('div');
      calculatedRow.classList.add("calculatedRow");
      switch (i) {
         case 0:
            calculatedRow.innerHTML = `
               ${ mean.toFixed(2) }
            `;
            break;
         case 1:
            calculatedRow.innerHTML = `
               ${ stdDev.toFixed(4) }
            `;
            break;
         case 2:
            calculatedRow.innerHTML = `
               ${ variance.toFixed(4) }
            `;
            break;
         case 3:
            calculatedRow.innerHTML = `
               ${ skewness.toFixed(4) }
            `;
            break;
         case 4:
            calculatedRow.innerHTML = `
               ${ excess.toFixed(4) }
            `;
            break;
      }
      calculatedColumn.appendChild(calculatedRow);
   }
}

// Функция, которая возвращает случайное целое число от min до max включительно
function myRandom(min, max) {
   return Math.floor(Math.random() * (max - min + 1) + min);
}

// Функция, которая возвращает факториал числа n
function factorial(n) {
   // Если n равно 0 или 1, то возвращаем 1
   if (n === 0 || n === 1) {
      return 1;
   }
   // Иначе, возвращаем произведение n и факториала n-1
   else {
      return n * factorial(n - 1);
   }
}

// Обработчик событий для реагирования на выбор метода 
generationMethod.addEventListener('change', () => {
   switch (generationMethod.value) {
      case "1.1 Бернулли":
         generatorOptionQ.style.display = "block";
         generatorOptionM.style.display = "none";
         generatorOptionAlpha.style.display = "none";
         generatorOptionDescret.style.display = "none";
         break;

      case "1.2 Биномиальное":
         generatorOptionQ.style.display = "block";
         generatorOptionM.style.display = "block";
         generatorOptionAlpha.style.display = "none";
         generatorOptionDescret.style.display = "none";
         break;

      case "1.3 Пуассона":
         generatorOptionAlpha.style.display = "block";
         generatorOptionQ.style.display = "none";
         generatorOptionM.style.display = "none";
         generatorOptionDescret.style.display = "none";
         break;

      case "1.4 Дискретное":
         generatorOptionAlpha.style.display = "none";
         generatorOptionQ.style.display = "none";
         generatorOptionM.style.display = "none";
         generatorOptionDescret.style.display = "none";
         break;

      default:
         generatorOptionQ.style.display = "none";
         generatorOptionM.style.display = "none";
         generatorOptionAlpha.style.display = "none";
         generatorOptionDescret.style.display = "none";
         break;
   }
});

// Обработчик кнопки очистки
clearButton.addEventListener('click', clear);