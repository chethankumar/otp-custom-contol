import { Component,NgZone } from '@angular/core';
import { NavController, NavParams,ViewController,AlertController } from 'ionic-angular';

@Component({
  template: `
  <ion-header>
 <ion-toolbar>
   <ion-title>
    OTP Authentication
   </ion-title>
   <ion-buttons start>
     <button ion-button (click)="dismiss()">
       <ion-icon name="md-close"></ion-icon>
     </button>
   </ion-buttons>
 </ion-toolbar>
</ion-header>
  <ion-content padding>
   
        <ion-item>
          <ion-label color="primary" floating>Enter your mobile number</ion-label>
          <ion-input type="number" [(ngModel)]="phoneNumber" ></ion-input>
        </ion-item>
        <p><font color="red"><pre> {{ result }}</pre></font></p>
        <div>
            <button ion-button (click)="register()">Register</button>
        </div>
    
  
  </ion-content>
  `,
})
export class OptModal {
    private TwilioOTPChallengeHandler: WL.Client.SecurityCheckChallengeHandler;

    result:string="";
    phoneNumber: string = "";
    securityCheck: string = "TwilioOTP";

  constructor(public navCtrl: NavController, public navParams: NavParams,public viewCtrl:ViewController,public alertCtrl: AlertController,private zone: NgZone) {
    
  }

 
  registerChallengeHandler() {
    this.TwilioOTPChallengeHandler = WL.Client.createSecurityCheckChallengeHandler("TwilioOTP");
    this.TwilioOTPChallengeHandler.handleChallenge = ((challenge: any) => {
      console.log('--> TwilioOTPChallengeHandler.handleChallenge called');
      this.displayLoginChallenge(challenge);
    });
  }

  displayLoginChallenge(response) {
    if (response.errorMsg) {
      var msg = response.errorMsg;
      console.log('--> displayLoginChallenge ERROR: ' + msg);
    }
    let prompt = this.alertCtrl.create({
      title: msg,
      message: '',
      inputs: [
        {
          name: 'OTP',
          placeholder: 'Enter the verification code'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            this.TwilioOTPChallengeHandler.cancel();
          }
        },
        {
          text: 'Verify',
          handler: data => {
            data.phoneNumber = response.phoneNumber;
            data.countryCode = response.countryCode;
            this.TwilioOTPChallengeHandler.submitChallengeAnswer(data);
          }
        }
      ]
    });
    prompt.present();
  }

  register(){
    this.registerChallengeHandler();
    let credentials = {
        phoneNumber : this.phoneNumber,
        countryCode : '1'
      };
      WLAuthorizationManager.login(this.securityCheck, credentials).then(() => {
        console.log('-->  Phone Number Registration: Success ');
        this.zone.run(() => {
        //   this.result = "Phone Number Successfully verifed";
            this.phoneNumber = "";
          
          this.viewCtrl.dismiss(null,'Phone Number Successfully verifed');
        });
      },
      function(error){
        console.log('--> Phone Registration:  ERROR ', error.responseText);
        this.zone.run(() => {
        //   this.result = "Phone Number Verification Failed";
          this.phoneNumber = "";
          this.viewCtrl.dismiss('Phone Number Verification Failed');
        });
      });
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }

}
