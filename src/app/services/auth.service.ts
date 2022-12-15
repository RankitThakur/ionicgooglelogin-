import { Injectable } from '@angular/core';
import { User } from '../shared/user.interface';

import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public newUsers: Observable<User>;

  constructor(
    private auth: AngularFireAuth,
    private fireBase: AngularFirestore,
    private router: Router,
    private toastCtrl: ToastController
    
  ) {
    this.newUsers = this.auth.authState.pipe(
      switchMap((user) => {
        /////SwitchMap maps each value from the source observable into an inner observable, subscribes to it,///
        if (user) {
          return this.fireBase.doc<User>(`users/${user.uid}`).valueChanges();
        }
        return of(null);
      })
    );
  }

  ///////registation page service
  async register(email: string, password: string): Promise<User> {
    try {
      const { user } = await this.auth.createUserWithEmailAndPassword(
        email,
        password
      );
      await this.sendVerifcationEmail();
      return user;
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: `${error}`,
        duration: 1000,
      });
      return toast.present();

    }
  }
  //////send verifcation email page
  async sendVerifcationEmail(): Promise<void> {
    try {
      return (await this.auth.currentUser).sendEmailVerification();
    } catch (error) {
      console.log('Error->', error);
    }
  }

  ///////login page service
  async login(email: string, password: string): Promise<User> {
    try {
      const { user } = await this.auth.signInWithEmailAndPassword(
        email,
        password
      );
      this.updateUserData(user);
      return user;
    } catch (error) {
      console.log('Error->', error);
    }
  }

  ///////loginGoogle page service
  async loginGoogle(): Promise<User> {
    try {
      const { user } = await this.auth.signInWithPopup(
        new firebase.auth.GoogleAuthProvider()
      );
      this.updateUserData(user);
      return user;
    } catch (error) {
      console.log('Error->', error);
    }
  }

  ///////logout page service
  async logout(): Promise<void> {
    try {
      await this.auth.signOut();
    } catch (error) {
      console.log('error', error);
    }
  }

  ///////Update page service
  private updateUserData(user: User) {
    const userRef: AngularFirestoreDocument<User> = this.fireBase.doc(
      `users/${user.uid}`
    );
    const data: User = {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
    };
    return userRef.set(data, { merge: true });
  }

  isEmailVerified(user: User): boolean {
    return user.emailVerified === true ? true : false;
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return user 
  }

}
