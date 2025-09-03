import { redirect } from 'next/navigation'

export default function ProfileBySlugPage({ params }: { params: { slug: string } }) {
	redirect(`/${params.slug}`)
}
