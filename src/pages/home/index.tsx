import { db } from '@/services/firebase'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export interface CarImageProps {
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

export function Home() {
  const [cars, setCars] = useState<CarProps[]>([])
  const [inputSearch, setImputSearch] = useState<string>('')
  const [loadingImage, setLoadingImage] = useState<string[]>([])

  useEffect(() => {
    loadCars()
  }, [])

  async function loadCars() {
    const carsRef = collection(db, 'cars')
    const carsQuery = query(carsRef, orderBy('created', 'desc'))

    await getDocs(carsQuery).then((snapshot) => {
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
  }

  function onLoadingImage(id: string) {
    setLoadingImage((previewImage) => [...previewImage, id])
  }

  async function handleSearchCar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (inputSearch === '') {
      loadCars()
      return
    }

    setCars([])
    setLoadingImage([])

    const carsQuery = query(
      collection(db, 'cars'),
      where('name', '>=', inputSearch.toLocaleUpperCase()),
      where('name', '<=', inputSearch.toUpperCase() + '\uf8ff'),
    )

    await getDocs(carsQuery).then((snapshot) => {
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
  }

  return (
    <>
      <form
        onSubmit={handleSearchCar}
        className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2"
      >
        <input
          type="text"
          placeholder="Digite o nome do carro"
          className="w-full border-2 rounded-lg h-9 px-3 outline-none"
          value={inputSearch}
          onChange={(e) => setImputSearch(e.target.value)}
        />
        <button
          type="submit"
          className="bg-red-500 h-9 px-8 rounded-lg text-white font-medium text-lg"
        >
          Buscar
        </button>
      </form>

      <h1 className="font-bold text-center mt-6 text-2xl mb-4">
        Carros novos e usados em todo o Brasil
      </h1>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars &&
          cars.map((car) => {
            return (
              <Link key={car.id} to={`/details/${car.id}`}>
                <section className="w-full bg-white rounded-lg hover:scale-105 transition-all cursor-pointer">
                  <div
                    className="w-full h-72 rounded-lg bg-slate-200"
                    style={{
                      display: !loadingImage.includes(car.id)
                        ? 'block'
                        : 'none',
                    }}
                  />

                  <img
                    className="w-full rounded-t-lg mb-2 max-h-72"
                    src={car.photos[0].url}
                    alt={car.photos[0].name}
                    onLoad={() => onLoadingImage(car.id)}
                    style={{
                      display: loadingImage.includes(car.id) ? 'block' : 'none',
                    }}
                  />

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
              </Link>
            )
          })}
      </main>
    </>
  )
}
