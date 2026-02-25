import React, { use, useEffect } from 'react'
import { z } from 'zod';  
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
} from "@/components/ui/select"
import { City } from 'country-state-city';
import useFetch from '@/hooks/use-fetch';
import { getCompanies } from '@/api/apiCompanies';
import { useUser } from '@clerk/clerk-react';
import { BarLoader } from 'react-spinners';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MDEditor from '@uiw/react-md-editor';
import { addNewJob } from '@/api/apiJobs';
import { useNavigate } from 'react-router-dom';
import AddCompanyDrawer from '@/components/add-company-drawer';



const schema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  location: z.string().min(1, { message: "Select a location" }),
  company_id: z.string().min(1, { message: "Select or Add a new Company" }),
  requirements: z.string().min(1, { message: "Requirements are required" }),
});

const PostJob = () => {

  const { user, isLoaded  } = useUser();
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { location: "", company_id: "", requirements: "" },
    resolver: zodResolver(schema),  
  });

   const {
    fn: fnCompanies,
    data: companies,
    loading: loadingCompanies,
  } = useFetch(getCompanies);


  useEffect(() => {
    if (isLoaded) {
      fnCompanies();
    }
  }, [isLoaded]);

  const {
    loading: loadingCreateJob,
    error: errorCreateJob,
    data: dataCreatedJob,
    fn: fnCreateJob,
  } = useFetch(addNewJob);

  const onSubmit = (data) => {
    fnCreateJob({
      ...data,
      recruiter_id: user.id,
      isOpen: true,
    });
  };

  useEffect(() => {
    if (dataCreatedJob?.length > 0) navigate("/jobs"); 
  }, [loadingCreateJob]);

  if (!isLoaded || loadingCompanies) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  if (user?.unsafeMetadata?.role !== "recruiter") {
    return <Navigate to="/jobs" />;
  }

  return (
    <div>
        <h1 className="gradient-title font-extrabold text-5xl sm:text-7xl text-center pb-8">
          Post a Job
        </h1>

        <form className="flex flex-col gap-4 p-4 pb-0" onSubmit={handleSubmit(onSubmit)}>
          <Input placeholder="Job Title" {...register("title")} />
          {errors.title && <p className="text-red-500">{errors.title.message}</p>}

          <Textarea placeholder='description' {...register("description")} />
          {errors.description && <p className="text-red-500">{errors.description.message}</p>}

          <div className="flex gap-4 items-center">
            <Controller 
              name='location'
              control={control}
              render={({ field }) => ( 
                <Select 
                  value={field.value} onValueChange={(field.onChange)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {City.getCitiesOfCountry("PK").map(({ name }, index) => (
                        <SelectItem key={`${name}-${index}`} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )} 
            />
            
            <Controller 
              name='company_id'
              control={control}
              render={({ field }) => ( 
                <Select 
                  value={field.value} onValueChange={(field.onChange)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by Company">
                      {field.value ? companies.find((com) => com.id === Number(field.value))?.name : "Company"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={String(company.id)}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            <AddCompanyDrawer fetchCompanies={fnCompanies} />
          </div>

          {errors.location && (
            <p className="text-red-500">{errors.location.message}</p>
          )}
          {errors.company_id && (
            <p className="text-red-500">{errors.company_id.message}</p>
          )}

            <Controller
              name="requirements"
              control={control}
              render={({ field }) => (
                <MDEditor 
                  value={field.value}
                  onChange={field.onChange}
                  data-color-mode="dark" />
              )}
            />
            {errors.requirements && (
              <p className="text-red-500">{errors.requirements.message}</p>
            )}
            {errors.errorCreateJob && (
              <p className="text-red-500">{errors?.errorCreateJob?.message}</p>
            )}
            {errorCreateJob?.message && (
              <p className="text-red-500">{errorCreateJob?.message}</p>
            )}
            {loadingCreateJob && <BarLoader width={"100%"} color="#36d7b7" />}

            <Button type="submit" variant="blue" size="lg" className="mt-2">
              Submit
            </Button>

        </form>
    </div>
  )
}

export default PostJob;