import React, { useState, useEffect } from 'react';
import { Modal, ModalContent } from '@nextui-org/react';
import { X } from 'lucide-react'; 
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import Image from 'next/image';
import { setAuthState, setUserDetailsState } from '@/store/authSlice';
import { db } from '../../../firebaseConfig';
import Spinner from '../Spinner/Spinner';

import styles from './Auth.module.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const Auth = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const dispatch = useDispatch();

  const authImages = [
    {
      src: '/phone.jpg',
      title: 'Intelligent Collaboration',
      description: 'Experience seamless interaction with advanced AI.'
    },
    {
      src: '/images/Github.png',
      title: 'Multipurpose AI',
      description: 'From complex analysis to creative brainstorming, get intelligent support across domains.'
    },
    {
      src: '/images/personalized-assistance.jpg',
      title: 'Helpful Assistance',
      description: 'Tailored responses and ready to complete multiple tasks.'
    }
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % authImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  const handleAuth = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        await setDoc(
          userRef,
          {
            userDetails: {
              email: user.email,
              name: user.displayName,
              profilePic: user.photoURL,
            },
          },
          { merge: true }
        );
      } else {
        await setDoc(userRef, {
          userDetails: {
            email: user.email,
            name: user.displayName,
            profilePic: user.photoURL,
            createdAt: serverTimestamp(),
          },
        });
      }

      dispatch(setAuthState(true));
      dispatch(
        setUserDetailsState({
          uid: user.uid,
          name: user.displayName ?? '',
          email: user.email ?? '',
          profilePic: user.photoURL ?? '',
        })
      );
      props.onClose();
      setLoading(false);
    } catch (error) {
      console.log('error', error);
      setLoading(false);
    }
  };

  return (
    <Modal
      size="5xl"
      isOpen={props.isOpen}
      onClose={props.onClose}
      placement="center"
      backdrop="blur"
      radius="lg"
      classNames={{
        base: 'bg-transparent',
        wrapper: 'overflow-hidden',
      }}
    >
      <ModalContent className="p-0 overflow-hidden">
        {(onClose) => (
          <div className={styles.container}>
            {/* Left Section - Login */}
            <div className={styles.leftSection}>
              

              <div className={styles.header}>
                <Image width={32} height={32} src="/LogoB.png" alt="OmniPlex" />
                <h2>OmniPlex</h2>
              </div>

              <h1>Where <br />Knowledge Evolves</h1>

              <p>Sign in to unlock powerful AI capabilities</p>

              {loading ? (
                <div className={`${styles.authButton} flex items-center justify-center`}>
                  <Spinner />
                  <span className="ml-3">Signing in...</span>
                </div>
              ) : (
                <button
                  onClick={handleAuth}
                  className={styles.authButton}
                >
                  <Image src="/svgs/Google.svg" alt="Google" width={24} height={24} className="mr-3" />
                  Continue with Google
                </button>
              )}

              <div className={styles.terms}>
                <p>By signing in, you agree to our Terms of Service</p>
              </div>
            </div>

            {/* Right Section - Scrolling Images */}
            <div className={styles.rightSection}>
              <div
                className={styles.imageCarousel}
                style={{
                  transform: `translateX(-${currentImageIndex * (100 / authImages.length)}%)`,
                }}
              >
                {authImages.map((image, index) => (
                  <div key={index} className={styles.imageSlide}>
                    <div
                      className={styles.carouselImage}
                      style={{
                        backgroundImage: `url(${image.src})`,
                      }}
                    >
                      <div className={styles.imageOverlay}>
                        <h2>{image.title}</h2>
                        <p>{image.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Image Navigation Dots */}
              <div className={styles.dots}>
                {authImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={index === currentImageIndex ? styles.activeDot : styles.dot}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default Auth;