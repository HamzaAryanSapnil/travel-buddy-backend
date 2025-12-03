import { z } from "zod";

const stringRequired = (message: string) => z.string({ error: () => message });

const createItemSchema = z.object({
  body: z.object({
    planId: stringRequired("Plan ID is required."),
    dayIndex: z
      .number({ error: () => "Day index is required." })
      .int({ message: "Day index must be an integer." })
      .min(1, { message: "Day index must be at least 1." }),
    startAt: stringRequired("Start time must be a string.")
      .datetime({ message: "Start time must be a valid ISO datetime." })
      .optional(),
    endAt: stringRequired("End time must be a string.")
      .datetime({ message: "End time must be a valid ISO datetime." })
      .optional(),
    title: stringRequired("Title is required.")
      .min(3, { message: "Title must be at least 3 characters long." })
      .max(200, { message: "Title cannot exceed 200 characters." }),
    description: stringRequired("Description must be a string.")
      .max(2000, { message: "Description cannot exceed 2000 characters." })
      .optional(),
    locationId: stringRequired("Location ID must be a string.").optional(),
    order: z
      .number({ error: () => "Order must be a number." })
      .int({ message: "Order must be an integer." })
      .nonnegative({ message: "Order must be >= 0." })
      .optional()
  }).refine(
    (data) => {
      if (!data.startAt || !data.endAt) return true;
      const start = new Date(data.startAt);
      const end = new Date(data.endAt);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start;
    },
    {
      message: "endAt must be greater than or equal to startAt.",
      path: ["endAt"]
    }
  )
});

const updateItemSchema = z.object({
  params: z.object({
    id: stringRequired("Item ID is required.")
  }),
  body: z
    .object({
      dayIndex: z
        .number({ error: () => "Day index must be a number." })
        .int({ message: "Day index must be an integer." })
        .min(1, { message: "Day index must be at least 1." })
        .optional(),
      startAt: stringRequired("Start time must be a string.")
        .datetime({ message: "Start time must be a valid ISO datetime." })
        .optional(),
      endAt: stringRequired("End time must be a string.")
        .datetime({ message: "End time must be a valid ISO datetime." })
        .optional(),
      title: stringRequired("Title must be a string.")
        .min(3, { message: "Title must be at least 3 characters long." })
        .max(200, { message: "Title cannot exceed 200 characters." })
        .optional(),
      description: stringRequired("Description must be a string.")
        .max(2000, { message: "Description cannot exceed 2000 characters." })
        .optional(),
      locationId: stringRequired("Location ID must be a string.").optional(),
      order: z
        .number({ error: () => "Order must be a number." })
        .int({ message: "Order must be an integer." })
        .nonnegative({ message: "Order must be >= 0." })
        .optional()
    })
    .refine(
      (data) => {
        if (!data.startAt || !data.endAt) return true;
        const start = new Date(data.startAt as string);
        const end = new Date(data.endAt as string);
        return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start;
      },
      {
        message: "endAt must be greater than or equal to startAt.",
        path: ["endAt"]
      }
    )
});

const getItemsSchema = z.object({
  params: z.object({
    planId: stringRequired("Plan ID is required.")
  }),
  query: z.object({
    dayIndex: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    page: z.string().optional(),
    limit: z.string().optional()
  })
});

const getSingleItemSchema = z.object({
  params: z.object({
    id: stringRequired("Item ID is required.")
  })
});

const deleteItemSchema = z.object({
  params: z.object({
    id: stringRequired("Item ID is required.")
  })
});

const bulkUpsertItemSchema = z.object({
  dayIndex: z
    .number({ error: () => "Day index is required." })
    .int({ message: "Day index must be an integer." })
    .min(1, { message: "Day index must be at least 1." }),
  startAt: stringRequired("Start time must be a string.")
    .datetime({ message: "Start time must be a valid ISO datetime." })
    .optional(),
  endAt: stringRequired("End time must be a string.")
    .datetime({ message: "End time must be a valid ISO datetime." })
    .optional(),
  title: stringRequired("Title is required.")
    .min(3, { message: "Title must be at least 3 characters long." })
    .max(200, { message: "Title cannot exceed 200 characters." }),
  description: stringRequired("Description must be a string.")
    .max(2000, { message: "Description cannot exceed 2000 characters." })
    .optional(),
  locationId: stringRequired("Location ID must be a string.").optional(),
  order: z
    .number({ error: () => "Order must be a number." })
    .int({ message: "Order must be an integer." })
    .nonnegative({ message: "Order must be >= 0." })
    .optional(),
  id: stringRequired("ID must be a string.").optional()
});

const bulkUpsertSchema = z.object({
  body: z.object({
    planId: stringRequired("Plan ID is required."),
    items: z
      .array(bulkUpsertItemSchema)
      .min(1, { message: "At least one item is required." }),
    replace: z.boolean().optional().default(false)
  })
});

const reorderUpdateSchema = z.object({
  id: stringRequired("Item ID is required."),
  dayIndex: z
    .number({ error: () => "Day index is required." })
    .int({ message: "Day index must be an integer." })
    .min(1, { message: "Day index must be at least 1." }),
  order: z
    .number({ error: () => "Order is required." })
    .int({ message: "Order must be an integer." })
    .nonnegative({ message: "Order must be >= 0." })
});

const reorderSchema = z.object({
  body: z.object({
    planId: stringRequired("Plan ID is required."),
    updates: z
      .array(reorderUpdateSchema)
      .min(1, { message: "At least one update is required." })
  })
});

export const ItineraryValidation = {
  createItem: createItemSchema,
  updateItem: updateItemSchema,
  getItems: getItemsSchema,
  getSingleItem: getSingleItemSchema,
  deleteItem: deleteItemSchema,
  bulkUpsert: bulkUpsertSchema,
  reorder: reorderSchema
};

