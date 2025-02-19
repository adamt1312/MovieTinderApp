import axios from "axios";
import * as firebase from "firebase";
import "firebase/firestore";
import { Alert } from "react-native";
import keys from "../../../../config/keys";

export async function fetchUserNickname(uid) {
  try {
    const db = firebase.firestore();
    const user = await db.collection("users").doc(uid).get();
    return user.data().nickname;
  } catch (err) {
    Alert.alert("Error in fetchUserNickname: ", err.message);
  }
}

export async function fetchUser(uid) {
  try {
    const db = firebase.firestore();
    const user = await db.collection("users").doc(uid).get();
    return user.data();
  } catch (err) {
    Alert.alert("Error in fetchUser: ", err.message);
  }
}

export async function fetchUserLikedMovies() {
  try {
    const db = firebase.firestore();
    const currentUser = firebase.auth().currentUser;
    const movies = await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("likedMovies")
      .get();
    return movies.docs.map((doc) => doc.data());
  } catch (err) {
    Alert.alert("Error in fetchUserLikedMovies: ", err.message);
  }
}

export async function fetchUserPreferences(uid) {
  try {
    const db = firebase.firestore();
    // const currentUser = firebase.auth().currentUser;
    const preferencesProfile = await db
      .collection("users")
      .doc(uid)
      .collection("preferencesProfile")
      .doc("like")
      .get();
    return preferencesProfile.data();
  } catch (err) {
    Alert.alert("Error in fetchUserPreferences: ", err.message);
  }
}

export async function fetchUserDislikedMovies() {
  try {
    const db = firebase.firestore();
    const currentUser = firebase.auth().currentUser;
    const movies = await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("dislikedMovies")
      .get();
    return movies.docs.map((doc) => doc.data());
  } catch (err) {
    Alert.alert("Error in fetchUserDislikedMovies: ", err.message);
  }
}

export async function dbLibraryToLiked(movieObject) {
  try {
    const currentUser = firebase.auth().currentUser;
    const db = firebase.firestore();
    // delete from disliked (if exist)
    const docRef1 = await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("dislikedMovies")
      .doc(movieObject.id.toString())
      .delete();

    // add to liked
    const docRef2 = await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("likedMovies")
      .doc(movieObject.id.toString())
      .set(movieObject);

    // insert movie genres to liked genres, and compute 3 most prefered genres...

    updateLikedGenresCounter(movieObject).then((updatedGenresCounter) => {
      updatePreferedGenres(updatedGenresCounter);
    });

    updateLikedReleaseYearsCounter(movieObject).then(() => {
      updatePreferedReleaseYears();
    });
  } catch (err) {
    Alert.alert("There is something wrong!", err.message);
  }
}

export async function dbLibraryToDisliked(movieObject) {
  try {
    const currentUser = firebase.auth().currentUser;
    const db = firebase.firestore();
    // delete from liked (if exist)
    db.collection("users")
      .doc(currentUser.uid)
      .collection("likedMovies")
      .doc(movieObject.id.toString())
      .delete();

    // add to disliked
    db.collection("users")
      .doc(currentUser.uid)
      .collection("dislikedMovies")
      .doc(movieObject.id.toString())
      .set(movieObject);
  } catch (err) {
    Alert.alert("Error in dbLibraryToDisliked: ", err.message);
  }
}

// increment occurrence of genres of a movie and return the counter map from db...
export async function updateLikedGenresCounter(movieObject) {
  try {
    const db = firebase.firestore();
    const currentUser = firebase.auth().currentUser;

    for (let i = 0; i < movieObject.genre_ids.length; i++) {
      let gid = "liked_genres." + movieObject.genre_ids[i];
      let obj = {};
      obj[gid] = firebase.firestore.FieldValue.increment(1);
      await db
        .collection("users")
        .doc(currentUser.uid)
        .collection("preferencesProfile")
        .doc("like")
        .update(obj);
    }

    const doc = await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("preferencesProfile")
      .doc("like")
      .get();

    return doc.data().liked_genres;
  } catch (err) {
    Alert.alert("Error in updateLikedGenresCounter: ", err.message);
  }
}

// TODO: Can be used in the future, when negative logic will be implemented too..
export async function updateUserDislikedGenres(movieObject) {
  try {
    const db = firebase.firestore();
    const currentUser = firebase.auth().currentUser;

    movieObject.genre_ids.forEach((genre_id) => {
      let gid = "disliked_genres." + genre_id;
      let obj = {};
      obj[gid] = firebase.firestore.FieldValue.increment(1);
      db.collection("users")
        .doc(currentUser.uid)
        .collection("preferencesProfile")
        .doc("dislike")
        .update(obj);
    });

    return 1;
  } catch (err) {
    Alert.alert("Error in updateUserDislikedGenres: ", err.message);
  }
}

// choose 3 genres with most occurrences...
export async function updatePreferedGenres(liked_genres_obj) {
  try {
    const db = firebase.firestore();
    const currentUser = firebase.auth().currentUser;

    if (liked_genres_obj != {}) {
      let arr = Object.values(liked_genres_obj);
      let prefered_genres = [];
      if (Object.keys(liked_genres_obj).length > 6) {
        for (let i = 0; i < 3; i++) {
          let maxValue = Math.max(...arr);
          let keyMaxValue = getKeyByValue(liked_genres_obj, maxValue);
          prefered_genres.push(keyMaxValue);
          arr.splice(arr.indexOf(maxValue), 1);
          delete liked_genres_obj[keyMaxValue];
        }
      } else if (Object.keys(liked_genres_obj).length < 6) {
        for (let i = 0; i < 2; i++) {
          let maxValue = Math.max(...arr);
          let keyMaxValue = getKeyByValue(liked_genres_obj, maxValue);
          prefered_genres.push(keyMaxValue);
          arr.splice(arr.indexOf(maxValue), 1);
          delete liked_genres_obj[keyMaxValue];
        }
      }
      db.collection("users")
        .doc(currentUser.uid)
        .collection("preferencesProfile")
        .doc("like")
        .update({ prefered_genres: prefered_genres });
    } else {
      console.log("No such document!");
    }

    return 1;
  } catch (err) {
    Alert.alert("Error in updatePreferedGenres: ", err.message);
  }
}

const getKeyByValue = (object, value) => {
  return Object.keys(object).find((key) => object[key] === value);
};

export async function updateLikedReleaseYearsCounter(movieObject) {
  try {
    const db = firebase.firestore();
    const currentUser = firebase.auth().currentUser;
    const increment = firebase.firestore.FieldValue.increment(1);

    if (movieObject != {}) {
      if (movieObject.release_date || movieObject.first_air_date) {
        let liked_doc = db
          .collection("users")
          .doc(currentUser.uid)
          .collection("preferencesProfile")
          .doc("like");
        const release_year = movieObject.release_date
          ? movieObject.release_date.split("-")[0]
          : movieObject.first_air_date.split("-")[0];
        if (release_year >= 2013) {
          await liked_doc.update({
            "liked_release_years.now - 2013": increment,
          });
        } else if (release_year > 2004 && release_year <= 2012) {
          await liked_doc.update({
            "liked_release_years.2012 - 2005": increment,
          });
        } else if (release_year < 2004) {
          await liked_doc.update({
            "liked_release_years.2004 - bellow": increment,
          });
        }
      }
      return 1;
    } else {
      console.log("No such document!");
      return 0;
    }
  } catch (err) {
    Alert.alert("Error in updateLikedReleaseYearsCounter: ", err.message);
  }
}

export async function updatePreferedReleaseYears() {
  try {
    const db = firebase.firestore();
    const currentUser = firebase.auth().currentUser;

    const liked_doc = await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("preferencesProfile")
      .doc("like")
      .get();

    const liked_years_obj = liked_doc.data().liked_release_years;
    let favoriteYears = [];

    if (!(Object.entries(liked_years_obj).length === 1)) {
      for (let i = 0; i < 2; i++) {
        let arr = Object.values(liked_years_obj);
        let maxValue = Math.max(...arr);
        let keyMaxValue = getKeyByValue(liked_years_obj, maxValue);
        favoriteYears.push(keyMaxValue);
        delete liked_years_obj[keyMaxValue];
      }
    } else {
      favoriteYears.push(Object.keys(liked_years_obj)[0]);
    }

    db.collection("users")
      .doc(currentUser.uid)
      .collection("preferencesProfile")
      .doc("like")
      .update({ prefered_release_years: favoriteYears });

    return 1;
  } catch (err) {
    Alert.alert("Error in updatePreferedReleaseYears: ", err.message);
  }
}

// fetch popular movies for questionaree when register, return as array of objects
export async function fetchPopularForQuest() {
  try {
    let popularMovies = [];
    let sortBy = [
      "popularity.asc",
      "popularity.desc",
      "release_date.asc",
      "release_date.desc",
      "revenue.asc",
      "revenue.desc",
      "primary_release_date.asc",
      "primary_release_date.desc",
      "original_title.asc",
      "original_title.desc",
      "vote_average.asc",
      "vote_average.desc",
      "vote_count.asc",
      "vote_count.desc",
    ];

    for (let index = 1; index < 7; index++) {
      let response = await axios(
        "https://api.themoviedb.org/3/discover/movie?api_key=" +
          keys.tmdbConfig.apiKey +
          "&sort_by=" +
          sortBy[Math.floor(Math.random() * sortBy.length)] +
          "&include_adult=false&include_video=false&page=" +
          index +
          "&vote_average.gte=7.5&vote_count.gte=10000"
      );
      response.data.results.forEach((movieObject) => {
        popularMovies.push(movieObject);
      });
    }
    return popularMovies;
  } catch (err) {
    Alert.alert("Error in fetchPopularForQuest: ", err.message);
  }
}

export async function isNewUser() {
  try {
    const db = firebase.firestore();
    const currentUser = firebase.auth().currentUser;

    const querySnapshot = await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("likedMovies")
      .limit(1)
      .get();
    if (querySnapshot.empty) {
      return true;
    } else return false;
  } catch (err) {
    Alert.alert("Error in isNewUser: ", err.message);
  }
}
