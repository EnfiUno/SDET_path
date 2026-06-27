 // Build a TestUser class with email, role, fullName() and Make all fields private; expose only what tests need.

import { test } from '@playwright/test'

class TestUser
{

     #email
     #role

     constructor(email,role)
        {
            this.#email = email
            this.#role = role
        }

        get email()
        {
            return this.#email
        }

        get role()
        {
            return this.#role
        }

        fullName()
        {
            let userfull = this.#email.split('@')[0]
            return userfull
        }


}

 let AdminUser = new TestUser ("eduardo.barajas@gmail.com", "Admin")
 let ViewerUser = new TestUser ("alma.guerrero@hotmail.com", "ReadOnly")
//Print the name of the users
test('Print Full Name Users', async () => {
   
    console.log(AdminUser.fullName())
    console.log(ViewerUser.fullName())
    
})

