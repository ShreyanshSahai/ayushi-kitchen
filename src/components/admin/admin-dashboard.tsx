"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";

type Ingredient = {
  id: number;
  name: string;
};

type FoodType = {
  id: number;
  name: string;
};

type FoodItem = {
  id: number;
  name: string;
  description: string | null;
  originalPrice: number;
  discountedPrice: number | null;
  isFeatured: boolean;
  isActive: boolean;
  typeId: number | null;
  type: FoodType | null;
  images: Array<{ id: number; path: string }>;
  madeWith: Array<{
    id: number;
    ingredientId: number;
    quantity: string;
    ingredient: Ingredient;
  }>;
};

type Order = {
  id: number;
  price: number;
  quantity: number;
  isActive: boolean;
  dateOrdered: string;
  foodItem: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string | null;
    mobile: string;
    email: string | null;
  } | null;
};

type AdminDashboardProps = {
  adminName: string;
};

type FoodFormState = {
  id?: number;
  name: string;
  description: string;
  originalPrice: string;
  discountedPrice: string;
  typeId: number | "";
  isFeatured: boolean;
  isActive: boolean;
  images: string[];
  madeWith: Array<{
    ingredientId: number | "";
    quantity: string;
  }>;
};

const emptyFoodForm: FoodFormState = {
  name: "",
  description: "",
  originalPrice: "",
  discountedPrice: "",
  typeId: "",
  isFeatured: false,
  isActive: true,
  images: [""],
  madeWith: [
    {
      ingredientId: "",
      quantity: "",
    },
  ],
};

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

type TabKey = "foods" | "types" | "ingredients" | "orders";

export function AdminDashboard({ adminName }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("foods");
  const [types, setTypes] = useState<FoodType[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [foodForm, setFoodForm] = useState<FoodFormState>(emptyFoodForm);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [typeRes, ingredientRes, foodRes, orderRes] = await Promise.all([
        fetch("/api/admin/types"),
        fetch("/api/admin/ingredients"),
        fetch("/api/admin/foods"),
        fetch("/api/admin/orders"),
      ]);

      if (
        !typeRes.ok ||
        !ingredientRes.ok ||
        !foodRes.ok ||
        !orderRes.ok
      ) {
        throw new Error("Failed to load dashboard data.");
      }

      const [typeData, ingredientData, foodData, orderData] = await Promise.all(
        [typeRes.json(), ingredientRes.json(), foodRes.json(), orderRes.json()],
      );

      setTypes(typeData);
      setIngredients(ingredientData);
      setFoods(
        foodData.map((food: FoodItem) => ({
          ...food,
          originalPrice: Number(food.originalPrice),
          discountedPrice:
            food.discountedPrice !== null ? Number(food.discountedPrice) : null,
        })),
      );
      setOrders(
        orderData.map((order: Order) => ({
          ...order,
          price: Number(order.price),
        })),
      );
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error ? error.message : "Unable to load data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAll();
  }, []);

  const resetFoodForm = () => setFoodForm(emptyFoodForm);

  const startEditFood = (food: FoodItem) => {
    setFoodForm({
      id: food.id,
      name: food.name,
      description: food.description ?? "",
      originalPrice: food.originalPrice.toString(),
      discountedPrice: food.discountedPrice?.toString() ?? "",
      typeId: food.typeId ?? "",
      isFeatured: food.isFeatured,
      isActive: food.isActive,
      images:
        food.images.length > 0
          ? food.images.map((image) => image.path)
          : [""],
      madeWith:
        food.madeWith.length > 0
          ? food.madeWith.map((entry) => ({
              ingredientId: entry.ingredientId,
              quantity: entry.quantity,
            }))
          : [
              {
                ingredientId: "",
                quantity: "",
              },
            ],
    });
  };

  const handleTypeCreate = async (name: string) => {
    if (!name.trim()) return;
    const response = await fetch("/api/admin/types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      setMessage("Unable to create type.");
      return;
    }
    await fetchAll();
    setMessage("Type created.");
  };

  const handleTypeUpdate = async (id: number, name: string) => {
    if (!name.trim()) return;
    const response = await fetch(`/api/admin/types/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      setMessage("Unable to update type.");
      return;
    }
    await fetchAll();
    setMessage("Type updated.");
  };

  const handleTypeDelete = async (id: number) => {
    const response = await fetch(`/api/admin/types/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setMessage("Unable to delete type. Remove dependent foods first.");
      return;
    }
    await fetchAll();
    setMessage("Type deleted.");
  };

  const handleIngredientCreate = async (name: string) => {
    if (!name.trim()) return;
    const response = await fetch("/api/admin/ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      setMessage("Unable to create ingredient.");
      return;
    }
    await fetchAll();
    setMessage("Ingredient created.");
  };

  const handleIngredientUpdate = async (id: number, name: string) => {
    if (!name.trim()) return;
    const response = await fetch(`/api/admin/ingredients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      setMessage("Unable to update ingredient.");
      return;
    }
    await fetchAll();
    setMessage("Ingredient updated.");
  };

  const handleIngredientDelete = async (id: number) => {
    const response = await fetch(`/api/admin/ingredients/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setMessage("Unable to delete ingredient.");
      return;
    }
    await fetchAll();
    setMessage("Ingredient deleted.");
  };

  const handleFoodSubmit = async () => {
    if (!foodForm.name.trim() || !foodForm.originalPrice.trim()) {
      setMessage("Name and original price are required.");
      return;
    }

    const payload = {
      name: foodForm.name.trim(),
      description: foodForm.description.trim() || undefined,
      originalPrice: Number.parseFloat(foodForm.originalPrice),
      discountedPrice: foodForm.discountedPrice
        ? Number.parseFloat(foodForm.discountedPrice)
        : undefined,
      typeId: foodForm.typeId === "" ? undefined : Number(foodForm.typeId),
      isFeatured: foodForm.isFeatured,
      isActive: foodForm.isActive,
      images: foodForm.images
        .map((path) => path.trim())
        .filter((path) => path.length > 0),
      madeWith: foodForm.madeWith
        .filter(
          (entry) => entry.ingredientId !== "" && entry.quantity.trim().length > 0,
        )
        .map((entry) => ({
          ingredientId: Number(entry.ingredientId),
          quantity: entry.quantity,
        })),
    };

    const method = foodForm.id ? "PUT" : "POST";
    const url = foodForm.id
      ? `/api/admin/foods/${foodForm.id}`
      : "/api/admin/foods";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setMessage(body.error ?? "Unable to save food item.");
      return;
    }

    await fetchAll();
    resetFoodForm();
    setMessage(foodForm.id ? "Food item updated." : "Food item created.");
  };

  const handleFoodDelete = async (id: number) => {
    const response = await fetch(`/api/admin/foods/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setMessage("Unable to delete food item.");
      return;
    }

    await fetchAll();
    setMessage("Food item deleted.");
  };

  const handleOrderToggle = async (order: Order) => {
    const response = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !order.isActive }),
    });

    if (!response.ok) {
      setMessage("Unable to update order status.");
      return;
    }

    await fetchAll();
    setMessage("Order status updated.");
  };

  const typeMap = useMemo(
    () => new Map(types.map((type) => [type.id, type.name] as const)),
    [types],
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Hello, {adminName}</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Kitchen Command Center
          </h1>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-700"
        >
          Sign out
        </button>
      </header>

      <nav className="flex flex-wrap gap-2">
        {([
          { key: "foods", label: "Food Items" },
          { key: "types", label: "Types" },
          { key: "ingredients", label: "Ingredients" },
          { key: "orders", label: "Orders" },
        ] satisfies Array<{ key: TabKey; label: string }>).map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "bg-orange-500 text-white shadow"
                : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:text-orange-600"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {message && (
        <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          {message}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow">
          Loading dashboard data...
        </div>
      ) : (
        <>
          {activeTab === "foods" && (
            <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Food inventory
                  </h2>
                  <button
                    type="button"
                    className="text-sm font-medium text-orange-600 hover:text-orange-700"
                    onClick={resetFoodForm}
                  >
                    + New
                  </button>
                </div>
                <div className="mt-6 space-y-4">
                  {foods.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No dishes yet. Create one using the form.
                    </p>
                  ) : (
                    foods.map((food) => (
                      <div
                        key={food.id}
                        className="rounded-2xl border border-slate-100 p-4 hover:border-orange-200"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {food.name}
                            </h3>
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                              {food.typeId !== null
                                ? typeMap.get(food.typeId) ?? "Uncategorised"
                                : "Uncategorised"}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-semibold text-orange-600">
                              {currency.format(food.discountedPrice ?? food.originalPrice)}
                            </p>
                            {food.discountedPrice && (
                              <p className="text-xs text-slate-400 line-through">
                                {currency.format(food.originalPrice)}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                          {food.description}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          {food.isFeatured && (
                            <span className="rounded-full bg-orange-100 px-2 py-1 text-orange-600">
                              Featured
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2 py-1 ${
                              food.isActive
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {food.isActive ? "Active" : "Inactive"}
                          </span>
                          {food.madeWith.map((entry) => (
                            <span
                              key={entry.id}
                              className="rounded-full bg-slate-100 px-2 py-1"
                            >
                              {entry.ingredient.name} ({entry.quantity})
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-orange-300 hover:text-orange-600"
                            onClick={() => startEditFood(food)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-500 hover:border-red-300"
                            onClick={() => handleFoodDelete(food.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100">
                <h2 className="text-xl font-semibold text-slate-900">
                  {foodForm.id ? "Edit dish" : "Create a dish"}
                </h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">
                      Name
                      <input
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                        value={foodForm.name}
                        onChange={(event) =>
                          setFoodForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">
                      Description
                      <textarea
                        className="mt-1 h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                        value={foodForm.description}
                        onChange={(event) =>
                          setFoodForm((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="text-xs font-semibold text-slate-500">
                      Original price
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                        value={foodForm.originalPrice}
                        onChange={(event) =>
                          setFoodForm((prev) => ({
                            ...prev,
                            originalPrice: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs font-semibold text-slate-500">
                      Discounted price
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                        value={foodForm.discountedPrice}
                        onChange={(event) =>
                          setFoodForm((prev) => ({
                            ...prev,
                            discountedPrice: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">
                      Type
                      <select
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                        value={foodForm.typeId === "" ? "" : String(foodForm.typeId)}
                        onChange={(event) =>
                          setFoodForm((prev) => ({
                            ...prev,
                            typeId:
                              event.target.value === ""
                                ? ""
                                : Number(event.target.value),
                          }))
                        }
                      >
                        <option value="">Select type</option>
                        {types.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <input
                        type="checkbox"
                        checked={foodForm.isFeatured}
                        onChange={(event) =>
                          setFoodForm((prev) => ({
                            ...prev,
                            isFeatured: event.target.checked,
                          }))
                        }
                      />
                      Featured
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <input
                        type="checkbox"
                        checked={foodForm.isActive}
                        onChange={(event) =>
                          setFoodForm((prev) => ({
                            ...prev,
                            isActive: event.target.checked,
                          }))
                        }
                      />
                      Active
                    </label>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Images
                    </p>
                    <div className="mt-2 space-y-2">
                      {foodForm.images.map((path, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                            placeholder="https://example.com/image.jpg"
                            value={path}
                            onChange={(event) =>
                              setFoodForm((prev) => {
                                const nextImages = [...prev.images];
                                nextImages[index] = event.target.value;
                                return { ...prev, images: nextImages };
                              })
                            }
                          />
                          <button
                            type="button"
                            className="rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:border-red-300 hover:text-red-500"
                            onClick={() =>
                              setFoodForm((prev) => ({
                                ...prev,
                                images: prev.images.filter(
                                  (_, idx) => idx !== index,
                                ),
                              }))
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="text-xs font-medium text-orange-600 hover:text-orange-700"
                        onClick={() =>
                          setFoodForm((prev) => ({
                            ...prev,
                            images: [...prev.images, ""],
                          }))
                        }
                      >
                        + Add image
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Ingredients
                    </p>
                    <div className="mt-2 space-y-2">
                      {foodForm.madeWith.map((entry, index) => (
                        <div
                          key={`${index}-${entry.ingredientId}`}
                          className="flex gap-2"
                        >
                          <select
                            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                            value={
                              entry.ingredientId === ""
                                ? ""
                                : String(entry.ingredientId)
                            }
                            onChange={(event) =>
                              setFoodForm((prev) => {
                                const next = [...prev.madeWith];
                                next[index] = {
                                  ...next[index],
                                  ingredientId:
                                    event.target.value === ""
                                      ? ""
                                      : Number(event.target.value),
                                };
                                return { ...prev, madeWith: next };
                              })
                            }
                          >
                            <option value="">Select ingredient</option>
                            {ingredients.map((ingredient) => (
                              <option key={ingredient.id} value={ingredient.id}>
                                {ingredient.name}
                              </option>
                            ))}
                          </select>
                          <input
                            className="w-32 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                            placeholder="Quantity"
                            value={entry.quantity}
                            onChange={(event) =>
                              setFoodForm((prev) => {
                                const next = [...prev.madeWith];
                                next[index] = {
                                  ...next[index],
                                  quantity: event.target.value,
                                };
                                return { ...prev, madeWith: next };
                              })
                            }
                          />
                          <button
                            type="button"
                            className="rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:border-red-300 hover:text-red-500"
                            onClick={() =>
                              setFoodForm((prev) => ({
                                ...prev,
                                madeWith: prev.madeWith.filter(
                                  (_, idx) => idx !== index,
                                ),
                              }))
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="text-xs font-medium text-orange-600 hover:text-orange-700"
                        onClick={() =>
                          setFoodForm((prev) => ({
                            ...prev,
                            madeWith: [
                              ...prev.madeWith,
                              { ingredientId: "", quantity: "" },
                            ],
                          }))
                        }
                      >
                        + Add ingredient
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {foodForm.id && (
                      <button
                        type="button"
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
                        onClick={resetFoodForm}
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600"
                      onClick={handleFoodSubmit}
                    >
                      {foodForm.id ? "Update dish" : "Create dish"}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "types" && (
            <section className="grid gap-6 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100 md:grid-cols-[2fr,1fr]">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Types catalogue
                </h2>
                <ul className="mt-4 space-y-3">
                  {types.map((type) => (
                    <TypeRow
                      key={type.id}
                      type={type}
                      onSave={handleTypeUpdate}
                      onDelete={handleTypeDelete}
                    />
                  ))}
                  {types.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No types configured yet.
                    </p>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Add new type
                </h3>
                <CreateInlineForm
                  placeholder="e.g. Biryani"
                  onSubmit={handleTypeCreate}
                  ctaLabel="Create type"
                />
              </div>
            </section>
          )}

          {activeTab === "ingredients" && (
            <section className="grid gap-6 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100 md:grid-cols-[2fr,1fr]">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Ingredient pantry
                </h2>
                <ul className="mt-4 space-y-3">
                  {ingredients.map((ingredient) => (
                    <TypeRow
                      key={ingredient.id}
                      type={ingredient}
                      onSave={handleIngredientUpdate}
                      onDelete={handleIngredientDelete}
                    />
                  ))}
                  {ingredients.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No ingredients yet—add your staples!
                    </p>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Add ingredient
                </h3>
                <CreateInlineForm
                  placeholder="e.g. Basmati Rice"
                  onSubmit={handleIngredientCreate}
                  ctaLabel="Create ingredient"
                />
              </div>
            </section>
          )}

          {activeTab === "orders" && (
            <section className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Recent orders
                  </h2>
                  <p className="text-sm text-slate-500">
                    Track customer orders and update their status.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {orders.length} orders
                </span>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-3 pr-6">Dish</th>
                      <th className="py-3 pr-6">Customer</th>
                      <th className="py-3 pr-6">Quantity</th>
                      <th className="py-3 pr-6">Total</th>
                      <th className="py-3 pr-6">Ordered</th>
                      <th className="py-3 pr-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="py-3 pr-6 font-medium text-slate-900">
                          {order.foodItem.name}
                        </td>
                        <td className="py-3 pr-6 text-slate-600">
                          <div className="flex flex-col">
                            <span>{order.user?.name ?? "Guest"}</span>
                            <span className="text-xs text-slate-400">
                              {order.user?.mobile}
                            </span>
                            {order.user?.email && (
                              <span className="text-xs text-slate-400">
                                {order.user.email}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-6">{order.quantity}</td>
                        <td className="py-3 pr-6 font-semibold text-slate-900">
                          {currency.format(order.price)}
                        </td>
                        <td className="py-3 pr-6 text-xs text-slate-500">
                          {new Date(order.dateOrdered).toLocaleString()}
                        </td>
                        <td className="py-3 pr-6">
                          <button
                            type="button"
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                              order.isActive
                                ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                            }`}
                            onClick={() => handleOrderToggle(order)}
                          >
                            {order.isActive ? "Active" : "Completed"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-6 text-center text-sm text-slate-500"
                        >
                          No orders yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

type TypeRowProps<T extends { id: number; name: string }> = {
  type: T;
  onSave: (id: number, name: string) => void | Promise<void>;
  onDelete: (id: number) => void | Promise<void>;
};

function TypeRow<T extends { id: number; name: string }>({
  type,
  onSave,
  onDelete,
}: TypeRowProps<T>) {
  const [value, setValue] = useState(type.name);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    await onSave(type.id, value);
    setIsEditing(false);
  };

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3">
      {isEditing ? (
        <input
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      ) : (
        <span className="flex-1 text-sm font-medium text-slate-800">
          {type.name}
        </span>
      )}
      {isEditing ? (
        <>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
            onClick={() => {
              setValue(type.name);
              setIsEditing(false);
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white hover:bg-orange-600"
            onClick={handleSave}
          >
            Save
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-orange-300 hover:text-orange-600"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
          <button
            type="button"
            className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 hover:border-red-300"
            onClick={() => onDelete(type.id)}
          >
            Delete
          </button>
        </>
      )}
    </li>
  );
}

type CreateInlineFormProps = {
  placeholder: string;
  onSubmit: (value: string) => void | Promise<void>;
  ctaLabel: string;
};

function CreateInlineForm({
  placeholder,
  onSubmit,
  ctaLabel,
}: CreateInlineFormProps) {
  const [value, setValue] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(value);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      <input
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button
        type="submit"
        className="w-full rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
        disabled={!value.trim()}
      >
        {ctaLabel}
      </button>
    </form>
  );
}

