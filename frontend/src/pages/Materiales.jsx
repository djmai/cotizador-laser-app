import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { MaterialsAPI } from "@/lib/api";
import { fmtMoney, fmtNum } from "@/lib/calc";

const empty = {
  name: "",
  pricePerSheet: 0,
  sheetWidth: 600,
  sheetHeight: 400,
  thickness: 3,
  wasteFactor: 0.10,
};

export default function Materiales() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    try {
      const data = await MaterialsAPI.list();
      setMaterials(data);
    } catch (e) {
      toast.error("Error al cargar materiales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({
      name: m.name,
      pricePerSheet: m.pricePerSheet,
      sheetWidth: m.sheetWidth,
      sheetHeight: m.sheetHeight,
      thickness: m.thickness,
      wasteFactor: m.wasteFactor,
    });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Ingresa un nombre");
      return;
    }
    const payload = {
      name: form.name.trim(),
      pricePerSheet: parseFloat(form.pricePerSheet) || 0,
      sheetWidth: parseFloat(form.sheetWidth) || 0,
      sheetHeight: parseFloat(form.sheetHeight) || 0,
      thickness: parseFloat(form.thickness) || 0,
      wasteFactor: parseFloat(form.wasteFactor) || 0,
    };
    try {
      if (editing) {
        await MaterialsAPI.update(editing.id, payload);
        toast.success("Material actualizado");
      } else {
        await MaterialsAPI.create(payload);
        toast.success("Material creado");
      }
      setOpen(false);
      load();
    } catch (e) {
      toast.error("Error al guardar el material");
    }
  };

  const handleDelete = async (id) => {
    try {
      await MaterialsAPI.remove(id);
      toast.success("Material eliminado");
      load();
    } catch (e) {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-500 mb-2">
            // Materiales / Catalog
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Materiales</h1>
          <p className="text-sm text-zinc-600 mt-2">
            Configura las láminas, precios y desperdicio de cada material.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreate}
              data-testid="btn-new-material"
              className="rounded-sm bg-[#FF3333] hover:bg-[#CC0000]"
            >
              <Plus className="w-4 h-4 mr-2" /> Nuevo material
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-sm sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar material" : "Nuevo material"}
              </DialogTitle>
              <DialogDescription>
                Define las dimensiones de la lámina y su precio.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <Label className="field-label">Nombre</Label>
                <Input
                  data-testid="material-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Acrílico 3mm"
                  className="rounded-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="field-label">Precio lámina</Label>
                  <Input
                    data-testid="material-price"
                    type="number"
                    step="0.01"
                    value={form.pricePerSheet}
                    onChange={(e) =>
                      setForm({ ...form, pricePerSheet: e.target.value })
                    }
                    className="rounded-sm font-mono"
                  />
                </div>
                <div>
                  <Label className="field-label">Espesor (mm)</Label>
                  <Input
                    data-testid="material-thickness"
                    type="number"
                    step="0.1"
                    value={form.thickness}
                    onChange={(e) =>
                      setForm({ ...form, thickness: e.target.value })
                    }
                    className="rounded-sm font-mono"
                  />
                </div>
                <div>
                  <Label className="field-label">Ancho lámina (mm)</Label>
                  <Input
                    data-testid="material-width"
                    type="number"
                    value={form.sheetWidth}
                    onChange={(e) =>
                      setForm({ ...form, sheetWidth: e.target.value })
                    }
                    className="rounded-sm font-mono"
                  />
                </div>
                <div>
                  <Label className="field-label">Alto lámina (mm)</Label>
                  <Input
                    data-testid="material-height"
                    type="number"
                    value={form.sheetHeight}
                    onChange={(e) =>
                      setForm({ ...form, sheetHeight: e.target.value })
                    }
                    className="rounded-sm font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="field-label">
                    Desperdicio (decimal — 0.10 = 10%)
                  </Label>
                  <Input
                    data-testid="material-waste"
                    type="number"
                    step="0.01"
                    value={form.wasteFactor}
                    onChange={(e) =>
                      setForm({ ...form, wasteFactor: e.target.value })
                    }
                    className="rounded-sm font-mono"
                  />
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="rounded-sm"
                  data-testid="material-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="rounded-sm bg-[#FF3333] hover:bg-[#CC0000]"
                  data-testid="material-submit"
                >
                  {editing ? "Actualizar" : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="surface overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-500 text-sm font-mono">Cargando...</div>
        ) : materials.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No hay materiales registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <Th>Material</Th>
                  <Th className="text-right">Precio lámina</Th>
                  <Th className="text-right">Dimensiones (mm)</Th>
                  <Th className="text-right">Espesor</Th>
                  <Th className="text-right">Desperdicio</Th>
                  <Th className="text-right">Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-zinc-100 hover:bg-zinc-50"
                    data-testid={`row-material-${m.id}`}
                  >
                    <Td className="font-medium">{m.name}</Td>
                    <Td className="text-right font-mono tabular">
                      {fmtMoney(m.pricePerSheet)}
                    </Td>
                    <Td className="text-right font-mono tabular text-zinc-600">
                      {m.sheetWidth} × {m.sheetHeight}
                    </Td>
                    <Td className="text-right font-mono tabular text-zinc-600">
                      {m.thickness} mm
                    </Td>
                    <Td className="text-right font-mono tabular text-zinc-600">
                      {fmtNum(m.wasteFactor * 100, 0)}%
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-sm h-8 w-8"
                          onClick={() => openEdit(m)}
                          data-testid={`btn-edit-mat-${m.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="rounded-sm h-8 w-8 text-[#FF3333] hover:text-[#CC0000]"
                              data-testid={`btn-delete-mat-${m.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-sm">
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar material?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción es permanente. El material "{m.name}" será eliminado.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-sm">Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(m.id)}
                                className="rounded-sm bg-[#FF3333] hover:bg-[#CC0000]"
                                data-testid={`confirm-delete-mat-${m.id}`}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-left text-[10px] font-mono uppercase tracking-[0.1em] text-zinc-500 font-medium ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
