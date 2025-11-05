import Link from 'next/link'

function Page() {
  return (

    <div>
        
    <Link href="/auth/login ">
        Login
      </Link>
      <Link href="/auth/register">
        Register
      </Link>
    </div>
  )
}

export default Page