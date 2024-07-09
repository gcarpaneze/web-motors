import { NavigationBar } from '@/components/navigationBar'
import { useContextAuth } from '@/contexts/authProvider'
import { db, storage } from '@/services/firebase'
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
} from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'
import { useEffect, useState } from 'react'
import { FiTrash } from 'react-icons/fi'
import { toast } from 'react-toastify'

interface CarImageProps {
  name: string
  url: string
}

export interface CarProps {
  id: string
  name: string
  model: string
  description: string
  year: number
  price: number
  city: string
  km: number
  phone: number
  owner: {
    uid: string
    name: string
    email: string
  }
  photos: CarImageProps[]
}

export function Dashboard() {
  const { user } = useContextAuth()

  const uid = user?.uid

  const [cars, setCars] = useState<CarProps[]>([])
  const [loadingImage, setLoadingImage] = useState<string[]>([])

  useEffect(() => {
    if (!uid) return

    const carsRef = collection(db, 'cars')
    const carsQuery = query(carsRef, where('owner.uid', '==', uid))

    getDocs(carsQuery).then((snapshot) => {
      const snapshotList = [] as CarProps[]

      snapshot.forEach((doc) => {
        snapshotList.push({
          id: doc.id,
          name: doc.data().name,
          model: doc.data().model,
          description: doc.data().description,
          year: doc.data().year,
          km: doc.data().km,
          phone: doc.data().phone,
          city: doc.data().city,
          price: doc.data().price,
          photos: doc.data().photos,
          owner: {
            uid: doc.data().owner.uid,
            name: doc.data().owner.name,
            email: doc.data().owner.email,
          },
        })
      })
      setCars(snapshotList)
    })
  }, [uid])

  function onLoadingImage(id: string) {
    setLoadingImage((previewImage) => [...previewImage, id])
  }

  async function handleDeleteCar(car: CarProps) {
    if (!user) return

    if (car.photos) {
      try {
        car.photos.forEach((photo: CarImageProps) => {
          const starageRef = ref(storage, `images/${uid}/${photo.name}`)

          deleteObject(starageRef)
          toast.success('Carro deletado com sucesso')
        })
      } catch {
        toast.error('Erro ao excluir as imagens do storage')
        return
      }
    }

    const docRef = doc(db, 'cars', car.id)

    try {
      await deleteDoc(docRef).then(() => {
        setCars(cars.filter((item) => item.id !== car.id))
      })
    } catch (error) {
      console.log('Erro ao excluir o carro do banco de dados')
    }
  }

  return (
    <>
      <NavigationBar />

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars &&
          cars.map((car) => {
            return (
              <div key={car.id}>
                <section className="w-full bg-white rounded-lg hover:scale-105 transition-all cursor-pointer">
                  <div
                    className="w-full h-72 rounded-lg bg-slate-200"
                    style={{
                      display: !loadingImage.includes(car.id)
                        ? 'block'
                        : 'none',
                    }}
                  />

                  <div className="relative">
                    <button
                      onClick={() => handleDeleteCar(car)}
                      className="group absolute mt-2 mr-2 bg-white rounded-full flex p-2 right-0 hover:scale-105 hover:transition-all"
                    >
                      <FiTrash size={18} className="group-hover:text-red-500" />
                    </button>
                    <img
                      className="w-full rounded-t-lg mb-2 max-h-72"
                      src={car.photos[0].url}
                      alt={car.photos[0].name}
                      onLoad={() => onLoadingImage(car.id)}
                      style={{
                        display: loadingImage.includes(car.id)
                          ? 'block'
                          : 'none',
                      }}
                    />
                  </div>

                  <p className="font-bold mb-2 px-2">{car.name}</p>

                  <div className="flex flex-col px-2">
                    <span className="text-zinc-700 mb-6">
                      {car.year} | {Number(car.km).toLocaleString('pt-BR')} Km
                    </span>
                    <strong className="text-black font-medium text-xl">
                      {Number(car.price).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </strong>
                  </div>

                  <div className="w-full h-px bg-slate-100 my-2"></div>

                  <div className="px-2 pb-2">
                    <span className="text-black">{car.city}</span>
                  </div>
                </section>
              </div>
            )
          })}
      </main>
    </>
  )
}
