"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import postgres from "postgres";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer.",
  }),
  amount: z.coerce
    .number() // input elements with type="number" actually return a string
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // prevState - contains the state passed from the useActionState hook. You won't be using it in the action in this example, but it's a required prop.

  // Validate form fields using Zod
  // safeParse() will return an object containing either a success or error field.
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // If form validation fails, return errors (to the form) early (returned error will be "action's state"). Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  // Test: entered data will be logged in terminal/server-side (not browser/client-side), meaning form submission was processed on the server.
  console.log(validatedFields);

  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (_error) {
    // If a database error occurs, return a more specific error.
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  revalidatePath("/dashboard/invoices"); // clear the existing client cache, trigger a new request to the server and re-render the table, ensuring that the client-side views are consistent with the server-side state.
  redirect("/dashboard/invoices"); // call redirect after try/catch so that redirect would only be reachable if try is successful.
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData
) {
  // prevState - contains the state passed from the useActionState hook. You won't be using it in the action in this example, but it's a required prop.

  // Validate form fields using Zod
  // safeParse() will return an object containing either a success or error field.
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // If form validation fails, return errors (to the form) early (returned error will be "action's state"). Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  // Update data on the database
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (_error) {
    // If a database error occurs, return a more specific error.
    return {
      message: "Database Error: Failed to Update Invoice.",
    };
  }

  revalidatePath("/dashboard/invoices"); // clear the existing client cache, trigger a new request to the server and re-render the table, ensuring that the client-side views are consistent with the server-side state.
  redirect("/dashboard/invoices"); // call redirect after try/catch so that redirect would only be reachable if try is successful.
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath("/dashboard/invoices");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
    // The signIn method is a utility provided by NextAuth.js. It's automatically made available when you define your NextAuth configuration.
    // It works with the providers you define (in this case, the Credentials provider).
    // The signIn method can be invoked on the client side to send user credentials (e.g., email and password) to the back-end for authentication. This method can be imported from next-auth/react in your front-end code.
    // When you call signIn with the Credentials provider, NextAuth executes the authorize function defined in your configuration.
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}
