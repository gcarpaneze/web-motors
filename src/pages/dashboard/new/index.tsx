import { NavigationBar } from '@/components/navigationBar'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/input'
import { FiTrash, FiUpload } from 'react-icons/fi'
import { ChangeEvent, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useContextAuth } from '@/contexts/authProvider'
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage'
import { db, storage } from '@/services/firebase'
import { addDoc, collection } from 'firebase/firestore'
import { Footer } from '@/components/footer'
import { toast } from 'react-toastify'

const schemaFormNewCar = z.object({
  name: z.string().min(1, 'O nome do carro é obrigatório'),
  model: z.string().min(1, 'O modelo do carro é obrigatório'),
  year: z.string().min(1, 'O ano do carro é obrigatório'),
  km: z.coerce.number().min(1, 'A  quilometragem do carro é obrigatório'),
  price: z.coerce.number().min(1, 'O valor do carro é obrigatório'),
  city: z.string().min(1, 'A cidade é obrigatória'),
  phone: z
    .string()
    .min(11, 'O telefone é obrigatório')
    .refine((value) => /^(\d{11,12})$/.test(value), {
      message: 'Número de telefone inválido',
    }),
  description: z.string().min(12),
})

type formNewCarType = z.infer<typeof schemaFormNewCar>

interface ImageItemProps {
  uid: string
  name: string
  previewUrl: string
  url: string
}

export function New() {
  const { user } = useContextAuth()

  const [images, setImages] = useState<ImageItemProps[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<formNewCarType>({
    resolver: zodResolver(schemaFormNewCar),
  })

  async function handleAddNewCar(data: formNewCarType) {
    const { name, model, year, km, price, city, phone, description } = data

    if (images.length === 0) {
      toast.error('Envie pelo menos uma imagem para salvar o anúncio.')
      return
    }

    if (!user) return

    await addDoc(collection(db, 'cars'), {
      owner: {
        uid: user.uid,
        name: user.name,
        email: user.email,
      },
      name: name.toUpperCase(),
      model,
      year,
      km,
      price,
      city,
      phone,
      description,
      created: new Date(),
      photos: images.map((image) => {
        return {
          name: image.name,
          url: image.url,
        }
      }),
    })
      .then(() => {
        setImages([])
        reset()
        toast.success('Carro cadastrado com sucesso')
      })
      .catch(() => {
        toast.error('Erro ao cadastrar o veículo.')
      })
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const image = e.target.files[0]

      if (image.type === 'image/jpeg' || image.type === 'image/png') {
        await handleUpload(image)
      } else {
        alert('Envie uma imagem em JPEG ou PNG')
      }
    }
  }

  async function handleUpload(image: File) {
    if (!user) return

    const userUUID = user?.uid
    const imageUUID = uuidv4()

    const uploadRef = ref(storage, `images/${userUUID}/${imageUUID}`)

    uploadBytes(uploadRef, image)
      .then((snapshot) => {
        getDownloadURL(snapshot.ref).then((downloadUrl) => {
          const imageItem = {
            name: imageUUID,
            uid: userUUID,
            previewUrl: URL.createObjectURL(image),
            url: downloadUrl,
          }

          setImages((imagesItens) => [...imagesItens, imageItem])
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  async function handleRemoveFile(name: string) {
    const userUUID = user?.uid

    const deleteRef = ref(storage, `images/${userUUID}/${name}`)

    deleteObject(deleteRef)
      .then(() => {
        setImages(images.filter((image) => image.name !== name))
      })
      .catch((error) => {
        console.log(error)
        alert('Erro ao excluir a imagem do banco de dados')
      })
  }

  return (
    <div className="h-screen">
      <NavigationBar />

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mb-4">
        <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#000" />
          </div>
          <input
            type="file"
            accept="image/*"
            className="cursor-pointer opacity-0"
            onChange={handleFile}
          />
        </button>

        <div className="flex gap-2">
          {images &&
            images.map((image) => {
              return (
                <div
                  key={image.name}
                  className="flex justify-center items-center max-w-48 rounded-lg"
                >
                  <button
                    className="absolute"
                    onClick={() => handleRemoveFile(image.name)}
                  >
                    <FiTrash color="#fff" size={28} />
                  </button>
                  <img
                    src={image.previewUrl}
                    alt={image.name}
                    className="object-cover rounded-lg"
                  />
                </div>
              )
            })}
        </div>
      </div>

      <form
        onSubmit={handleSubmit(handleAddNewCar)}
        className="bg-white rounded-lg p-4"
      >
        <div className="flex flex-col md:grid md:grid-cols-2 gap-2">
          <label htmlFor="name" className="col-span-2">
            Nome do carro
            <Input
              name="name"
              id="name"
              register={register}
              type="text"
              error={errors.name?.message}
            />
          </label>

          <label htmlFor="model">
            Modelo
            <Input
              name="model"
              id="model"
              register={register}
              type="text"
              error={errors.model?.message}
            />
          </label>

          <label htmlFor="year">
            Ano
            <Input
              name="year"
              id="year"
              register={register}
              type="text"
              error={errors.year?.message}
            />
          </label>

          <label htmlFor="km">
            Km rodados
            <Input
              name="km"
              id="km"
              register={register}
              type="text"
              error={errors.km?.message}
            />
          </label>

          <label htmlFor="price">
            Valor em R$
            <Input
              name="price"
              id="price"
              register={register}
              type="text"
              error={errors.price?.message}
            />
          </label>

          <label htmlFor="city">
            Cidade
            <Input
              name="city"
              id="city"
              register={register}
              type="text"
              error={errors.city?.message}
            />
          </label>

          <label htmlFor="phone">
            Telefone
            <Input
              name="phone"
              id="phone"
              register={register}
              type="text"
              error={errors.phone?.message}
            />
          </label>

          <label htmlFor="description" className="col-span-2">
            Descrição
            <textarea
              {...register('description')}
              id="description"
              className="block w-full border-2 rounded-md h-24 p-2 resize-none"
            />
            {errors.description && (
              <p className="my-1 text-red-500">{errors.description.message}</p>
            )}
          </label>
        </div>

        <button
          type="submit"
          className="bg-zinc-900 w-full rounded-md h-10 font-medium text-white mt-10"
        >
          Cadastrar
        </button>
      </form>

      <Footer />
    </div>
  )
}
