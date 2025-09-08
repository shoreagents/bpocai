import { redirect } from 'next/navigation'

export default function ProfileBySlugPage({ params }: { params: { slug: string } }) {
	// Redirect to the main slug page which now only handles profiles
	redirect(`/${params.slug}`)
}
