"use client"

import EnterPasswordDialog from '@/components/profile/confirm-attendence/EnterPasswordDialog'
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import OnlyLannaHackers from '@/components/profile/confirm-attendence/OnlyLannaHackers'

const Page = () => {
  const [success, setSuccess] = useState(false)


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
          <EnterPasswordDialog isFromCreation={true} setSuccessParentState={setSuccess}  />
          </div>
          <div>
            {success && <div>
              <OnlyLannaHackers />
              </div>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center ">
            <Link href="/matching">
       {!success && <Button variant="outline" className='w-full'>Skip</Button>}
          {success && 
          
          <Button className='w-full'>Confirm</Button>
          
          }
          </Link>
       
        </CardFooter>
      </Card>
    </div>
  )
}

export default Page
