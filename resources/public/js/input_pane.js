function InputPane(name) {
         this = document.createElement('div');
         this.setAttribute('name', name);
         this.setAttribute('class', 'input_pane');

         function addItem(name) {
                  this.appendChild(new InputItem(name));
         }

         this.addItem = addItem;
}

function InputItem(name) {
         this = document.createElement('div');
         this.setAttribute('name', name);
         this.setAttribute('class', 'input_item');

         var label1 = document.createElement('div');
         label1.setAttribute('name', name + "_label");
         label1.setAttribute('class', 'input_item_label');
         label1.innerHTML = name;

         var minus = document.createElement('input');
         minus.setAttribute('type', 'radio');
         minus.setAttribute('name', name + "_radio_minus");
         minus.setAttribute('class', 'input_item_radio');
         minus.setAttribute('value', "1");
         minus.innerHTML = "-";

         var plus = document.createElement('input');
         plus.setAttribute('type', 'radio');
         plus.setAttribute('name', name + "_radio_plus");
         plus.setAttribute('class', 'input_item_radio');
         plus.setAttribute('value', "2");
         plus.innerHTML = "+";

         var label2 = document.createElement('div');
         label2.setAttribute('name', name + "_label");
         label2.setAttribute('class', 'input_item_label');
         label2.innerHTML = "weight";

         var weight = document.createElement('input');
         weight.setAttribute('type', 'text');
         weight.setAttribute('name', name + "_weight");
         weight.setAttribute('class', 'input_item_text');
         weight.setAttribute('value', '1');

         this.appendChild(label1);
         this.appendChild(minus);
         this.appendChild(plus);
         this.appendChild(label2);
         this.appendChild(weight);

         function getValues() {
                  var rad = minus.checked ? "-" : "+";
                  return rad + weight.value;
         }

         this.getValues = getValues;
}
