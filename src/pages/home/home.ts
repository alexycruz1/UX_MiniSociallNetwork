import { Component } from '@angular/core';
import {
  NavController,
  AlertController, // To Add Button
  ActionSheetController // To delete
} from 'ionic-angular';

import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from '@firebase/util';
import { Subscription } from 'rxjs/Rx';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  fakeArray = new Array<number>();

  currentUser: any;

  users: AngularFireList<any>;
  userRef: any;

  posts: AngularFireList<any>;
  postRef: any;

  relations: AngularFireList<any>;
  relationRef: any;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController, public afDatabase: AngularFireDatabase,
    public afAuth: AngularFireAuth) {

    this.userRef = this.afDatabase.list('users');
    this.users = this.userRef.valueChanges();

    this.postRef = this.afDatabase.list('posts');
    this.posts = this.postRef.valueChanges();

    this.relationRef = this.afDatabase.list('relations');
    this.relations = this.relationRef.valueChanges();

    afAuth.authState.subscribe(user => {
      if (!user) {
        this.currentUser = null;
        return;
      }
      this.currentUser = {
        uid: user.uid, photoURL: user.photoURL, displayName: user.displayName
      };
    });
  }

  searchUsers() {
    var input, filter, table, tr, td, i;
    input = (<HTMLInputElement>document.getElementById("searchInput"));
    filter = input.value.toUpperCase();
    table = (<HTMLTableElement>document.getElementById("userTable"));
    tr = table.getElementsByTagName("tr");

    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[0];
      if (td) {
        if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }

  fillArray() {
    this.fakeArray = new Array<number>();

    for (let i = 100; i > -1; i--) {
      this.fakeArray.push(i);
    }

    return true;
  }

  like(postId, liked) {
    liked += 1;

    this.postRef.update(postId, {
      likes: liked
    });

  }

  dislike(postId, liked) {
    liked += 1;

    this.postRef.update(postId, {
      dislikes: liked
    });

  }

  follow(currentUserId, followedUserId, userName, followedByName) {
    if (currentUserId != followedUserId) {
      if (confirm("Are you sure you wanna follow this user?")) {
        const newRelationRef = this.relationRef.push({});

        newRelationRef.set({
          id: currentUserId + followedUserId, user: currentUserId, followedUser: followedUserId
        });

        alert(userName + " now follow " + followedByName);
      }
    } else {
    }
  }

  login() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then((response) => {
        this.userRef.update(response.user.uid,
          {
            userId: response.user.uid,
            displayName: response.user.displayName,
            photoURL: response.user.photoURL
          });
      });
  }

  post() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'People you want to share your message with',
      buttons: [
        {
          text: 'Public',
          handler: () => {
            const newPostRef = this.postRef.push({});
            var displayDate = new Date().toLocaleDateString();

            newPostRef.set({
              message: (<HTMLInputElement>document.getElementById("textArea")).value, likes: 0, dislikes: 0, privacyState: "Public",
              authorId: this.currentUser.uid, authorName: this.currentUser.displayName, authorPhoto: this.currentUser.photoURL,
              date: displayDate, id: newPostRef.key
            });
          }
        }, {
          text: 'Share with friends',
          handler: () => {
            const newPostRef = this.postRef.push({});
            var displayDate = new Date().toLocaleDateString();

            newPostRef.set({
              message: (<HTMLInputElement>document.getElementById("textArea")).value, likes: 0, dislikes: 0, privacyState: "My Friends",
              authorId: this.currentUser.uid, authorName: this.currentUser.displayName, authorPhoto: this.currentUser.photoURL,
              date: displayDate, id: newPostRef.key
            });
          }
        }, {
          text: 'Only Me',
          handler: () => {
            const newPostRef = this.postRef.push({});
            var displayDate = new Date().toLocaleDateString();

            newPostRef.set({
              message: (<HTMLInputElement>document.getElementById("textArea")).value, likes: 0, dislikes: 0, privacyState: "Only Me",
              authorId: this.currentUser.uid, authorName: this.currentUser.displayName, authorPhoto: this.currentUser.photoURL,
              date: displayDate, id: newPostRef.key
            });
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  isFollower(followedUserId, userWhoFollowsId, currentUserId, postAuthorId) {
    if ((userWhoFollowsId == postAuthorId) && (currentUserId == followedUserId)) {
      return true;
    } else {
      return false;
    }
  }
}