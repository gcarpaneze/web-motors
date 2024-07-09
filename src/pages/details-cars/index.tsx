import { db } from '@/services/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CarProps } from '../home'
import { FaWhatsapp } from 'react-icons/fa'
import { Footer } from '@/components/footer'
import { Swiper, SwiperSlide } from 'swiper/react'

export function DetailsCars() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [car, setCar] = useState<CarProps>()
  const [sliderPerView, setSliderPerView] = useState<number>(2)

  useEffect(() => {
    async function getDetails() {
      if (!id) return

      const docRef = doc(db, 'cars', id)

      await getDoc(docRef)
        .then((snapshot) => {
          if (!snapshot.data()) {
            navigate('/')
          }

          if (snapshot.exists()) {
            setCar({
              id: snapshot.id,
              name: snapshot.data().name,
              model: snapshot.data().model,
              description: snapshot.data().description,
              year: snapshot.data().year,
              km: snapshot.data().km,
              phone: snapshot.data().phone,
              city: snapshot.data().city,
              price: snapshot.data().price,
              photos: snapshot.data().photos,
              owner: {
                uid: snapshot.data().owner.uid,
                name: snapshot.data().owner.name,
                email: snapshot.data().owner.email,
              },
            })
          }
        })
        .catch((error) => console.log(error))
    }

    getDetails()
  }, [id])

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 720) {
        setSliderPerView(1)
      } else {
        setSliderPerView(2)
      }
    }

    handleResize()

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <Swiper
        className="flex gap-0 w-full rounded-lg p-2"
        slidesPerView={sliderPerView}
        pagination={{ clickable: true }}
        navigation
      >
        {car?.photos.map((photo) => {
          return (
            <SwiperSlide key={photo.name}>
              <img
                src={photo.url}
                alt={photo.name}
                className="w-full h-96 object-cover"
              />
            </SwiperSlide>
          )
        })}
      </Swiper>

      {car && (
        <main className="w-full bg-white rounded-lg p-6 my-4">
          <div className="flex flex-col md:flex-row mb-4 items-center md:justify-between">
            <h1 className="font-bold text-3xl text-black">{car?.name}</h1>
            <h1 className="font-bold text-3xl text-black">
              {Number(car?.price).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </h1>
          </div>

          <p>{car?.model}</p>

          <section className="flex w-full gap-8 my-4">
            <div className="flex flex-col gap-2">
              <p>
                Cidade
                <br />
                <strong>{car?.city}</strong>
              </p>

              <p>
                Ano
                <br />
                <strong>{car?.year}</strong>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p>
                KM
                <br />
                <strong>{car?.km}</strong>
              </p>
            </div>
          </section>

          <strong>Descrição:</strong>
          <p className="mb-4">{car?.description}</p>

          <strong>Telefone / WhatsApp:</strong>
          <p className="mb-4">{car?.phone}</p>

          <a
            href={`https://api.whatsapp.com/send?phone=${car?.phone}&text=Olá! Vi o anúncio ${car?.name} no WebCarros e fiquei interessado.`}
            className="font-medium cursor-pointer w-full bg-green-500 text-white flex items-center justify-center p-2 rounded-lg gap-2 text-xl"
            target="_blank"
            rel="noreferrer"
          >
            <FaWhatsapp size={26} color="#fff" />
            Conversar com o vendedor
          </a>
        </main>
      )}

      <Footer />
    </>
  )
}
