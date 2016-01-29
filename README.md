# AMDLoader - ver 2.4
Lightweight replacement for requirejs-a

Available via the MIT or new BSD license.


##Założenia :
Ta biblioteka implementuje funkcjonalność modułów AMD, lecz w przeciwieństwie do requirejs-a jest pozbawiona zbędnych dodatków. Dostępne są tylko dwie funkcje "require" i "define". Za ich pomocą możemy w pełni korzystać z AMD.

Ta biblioteka zawiera również loader który pozwala na automatyczne uruchamianie "modułów" przypisanych do tagów html. Czyli to obecność określonego taga na stronie decyduje czy ma się uruchomić konkretny moduł. To pociąga za sobą że ułatwia się zarządzanie zależnościami jsowymi. W head strony występuje tylko "loader" i zasadniczo to już wystarcza do tego aby robić w pełni funkcjonalne strony ze wszystkimi bajerami jsowymi.


##Loader w head strony :
```html
<script
    type="text/javascript"
    src="amdloader.js"
    data-amd-map="lib:js/lib1 lib2:js/lib1"
></script>
```

Atrybut data-amd-map określa mapowanie katalogów z modułami na konkretne ścieżki na serwerze. Dzięki temu zamiast podawać pełną ścieżkę do modułu (js/lib1/box2) można użyć skróconą wersję np. lib2/box2.

Przypisanie modułu do określonego taga na stronie :
```html
<div data-run-module="lib/box.renderTime" data-color="red">module1</div>
```

##Uruchamianie :
Amdloader uruchamia automatycznie wszystkie elementy na stronie które są oznaczone tym atrybutem "data-run-module".
Czyli następuje pobranie modułu lib/box a następnie wywoływana jest jego funkcja "renderująca" ten moduł o nazwie "renderTime".

Funkcja renderująca przyjmuje dwa argumenty :

function renderTime(domElement, callbackApi) { ... }

Pierwszy argument, to domElement tego elementu na którym został uruchomiony moduł. Drugi argument to funkcja zwrotna, przy pomocy której możemy zwrócić api tego modułu. Dzięki temu api, jakiś zewnętrzny moduł może się porozumiewać z tym modułem. Moduł nie musi udostępniać swojego api (to tylko opcja).


Gdy moduły są w sobie zagnieżdżone :
```html
<div data-run-module="path/mod.func1">
    <div data-run-module="path/mod.func2"></div>
    <div data-run-module="path/mod.func3"></div>
</div>
```

To loader automatycznie uruchamia tylko moduł zewnętrzny (path/mod.func1).
Ten moduł może zdecydować czy uruchomić lub nie uruchomić moduły zagnieżdżone (path/mod.func2, path/mod.func3).
To zachowanie pomocne jest wtedy gdy np. mamy zakładki i moduły na określonej zakładce chcemy uruchamiać dopiero w momencie gdy ta zakładka zostanie odkryta.

Aby uruchomić moduły zagnieżdżone, trzeba uruchomić funkcję : require.runnerBox.runElement(domElement).


Aby pobrać api modułu zagnieżdżonego, trzeba uruchomić funkcję :

```javascript
require.runnerBox.whenRun(domElement, function(api){
    //api tego modułu
});
```


##Moment automatycznego uruchamiania modułów przy ładowaniu strony.
Gdy zajdzie window.load jest uruchamiane. Gdy w ciągu 2 sekund od documentContentLoad nie zachodzi zdarzenie window.load, to loader nie oczekuje już na zdarzenie window.load i uruchamia moduły. Ten czas dwóch sekund można przedefiniować za pomocą atrybutu : data-timeout-start="9000" (w milisekundach).


