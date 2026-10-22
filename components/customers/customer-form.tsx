"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Customer } from "@/lib/queries/customers";

const schema = z.object({
  fullName: z.string().min(1, "Required"),
  idNumber: z.string().min(1, "Required"),
  customerType: z.enum(["local", "tourist", "expat"]),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  drivingLicense: z.string().optional(),
  licenseExpiry: z.string().optional(),
  address: z.string().optional(),
  nextOfKinName: z.string().optional(),
  nextOfKinPhone: z.string().optional(),
  employerDetails: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<Customer>;
  onSubmit: (data: CustomerFormValues) => void;
  loading?: boolean;
}

export function CustomerForm({ defaultValues, onSubmit, loading }: Props) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(schema) as Resolver<CustomerFormValues>,
    defaultValues: {
      fullName: defaultValues?.fullName ?? "",
      idNumber: defaultValues?.idNumber ?? "",
      customerType: (defaultValues?.customerType as CustomerFormValues["customerType"]) ?? "local",
      phone: defaultValues?.phone ?? "",
      email: defaultValues?.email ?? "",
      drivingLicense: defaultValues?.drivingLicense ?? "",
      licenseExpiry: defaultValues?.licenseExpiry ? defaultValues.licenseExpiry.slice(0, 10) : "",
      address: defaultValues?.address ?? "",
      nextOfKinName: defaultValues?.nextOfKinName ?? "",
      nextOfKinPhone: defaultValues?.nextOfKinPhone ?? "",
      employerDetails: defaultValues?.employerDetails ?? "",
    },
  });

  function handleSubmit(data: CustomerFormValues) {
    onSubmit({
      ...data,
      licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry).toISOString() : undefined,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="fullName" render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="idNumber" render={({ field }) => (
            <FormItem>
              <FormLabel>ID Number</FormLabel>
              <FormControl><Input placeholder="12345678" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (optional)</FormLabel>
              <FormControl><Input placeholder="+254 700 000 000" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email (optional)</FormLabel>
              <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField control={form.control} name="customerType" render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="tourist">Tourist</SelectItem>
                  <SelectItem value="expat">Expat</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="drivingLicense" render={({ field }) => (
            <FormItem>
              <FormLabel>Driving License (optional)</FormLabel>
              <FormControl><Input placeholder="DL-123456" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="licenseExpiry" render={({ field }) => (
            <FormItem>
              <FormLabel>License Expiry (optional)</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="address" render={({ field }) => (
          <FormItem>
            <FormLabel>Address (optional)</FormLabel>
            <FormControl><Input placeholder="Nairobi, Kenya" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="nextOfKinName" render={({ field }) => (
            <FormItem>
              <FormLabel>Next of Kin Name (optional)</FormLabel>
              <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="nextOfKinPhone" render={({ field }) => (
            <FormItem>
              <FormLabel>Next of Kin Phone (optional)</FormLabel>
              <FormControl><Input placeholder="+254 700 000 000" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="employerDetails" render={({ field }) => (
          <FormItem>
            <FormLabel>Employer Details (optional)</FormLabel>
            <FormControl><Input placeholder="Company name / role" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Customer
          </Button>
        </div>
      </form>
    </Form>
  );
}
