import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Guid } from 'guid-typescript';

interface EntryCode {
  a: string;
  b: string;
  c: string;
}


@Component({
  selector: 'epg-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  form: FormGroup;
  form2: FormGroup;
  title = 'entrypass-generator';

  part1Codigo = 'AAAA';
  part2Codigo = 'BBBB';
  part3Codigo = '0000000000';

  loading = false;
  testedCode = false;

  finished = false;

  showLegend = false;

  url = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=';
  // url = '';

  codes: EntryCode[] = [];

  regex = /^\d+$/;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      date: ['', [Validators.required]],
      codigo: ['', [Validators.required, Validators.maxLength(4)]],
      inicioNumero: [0, [Validators.required, Validators.pattern(this.regex), Validators.maxLength(10)]]
    });
    this.form2 = this.fb.group({
      howMany: [0, [Validators.required, Validators.pattern(this.regex), Validators.maxLength(4)]]
    });
  }

  toggleLegend(): void {
    this.showLegend = !this.showLegend;
  }

  createTestCode(): void {
    this.loading = true;
    setTimeout(() => {
      const date = moment(this.form.get('date').value);

      const month = date.month();
      const weekday = moment(date).format('llll').substring(0, 2).toUpperCase();
      const datenum = date.date();
      const week = date.week();
      const year = moment(date).format('YY');


      const code = this.form.get('codigo').value;
      const initNumber: number = (this.form.get('inicioNumero').value as number);

      const cuid = Guid.create();

      const sub = cuid.toString().substring(0, cuid.toString().indexOf('-'));

      // tslint:disable-next-line: max-line-length
      this.part1Codigo = code + year + (month + 1).toString().padStart(2, '0') + week.toString().padStart(2, '0') + weekday;

      this.part2Codigo = sub.toUpperCase();

      this.part3Codigo = initNumber.toString().padStart(10, '0');

      this.loading = false;
      this.testedCode = true;
    }, 1000);
  }


  generateCodes(): void {
    this.loading = true;
    setTimeout(() => {
      const howmany: number = this.form2.get('howMany').value;

      if (howmany > 0) {

        const date = moment(this.form.get('date').value);

        const month = date.month();
        const weekday = moment(date).format('llll').substring(0, 2).toUpperCase();
        const datenum = date.date();
        const week = date.week();
        const year = moment(date).format('YY');


        const code = this.form.get('codigo').value;
        let initNumber: number = (this.form.get('inicioNumero').value as number);
        initNumber = +initNumber;
        let index = 0;

        do {

          const cuid = Guid.create();

          const sub = cuid.toString().substring(0, cuid.toString().indexOf('-'));

          const a = code + year + (month + 1).toString().padStart(2, '0') + week.toString().padStart(2, '0') + weekday;

          const b = sub.toUpperCase();

          let c = (initNumber + index).toString().padStart(10, '0');

          this.codes.push({ a, b, c });

          index += 1;

          c = (initNumber + index).toString().padStart(10, '0');

          this.codes.push({ a, b, c });

          index += 1;

        } while (index < howmany);

      }
      this.loading = false;
      this.finished = true;
    }, 3000);
  }


  download(): void {
    const csvContent = 'data:text/txt;charset=utf-8,' + this.codes.map(e => e.a + '-' + e.b + '-' + e.c).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'my_data.txt');
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "my_data.csv".

  }
}
