import EnterPasswordDialog from '@/components/profile/confirm-attendence/EnterPasswordDialog'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

const Page = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold text-center text-primary">
            Confirm your hackathon attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
            <div className='flex items-center justify-center'>
          <EnterPasswordDialog />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center ">
            <Link href="/matching">
          <Button variant="outline" className='w-full'>Skip</Button>
          </Link>
       
        </CardFooter>
      </Card>
    </div>
  )
}

export default Page
