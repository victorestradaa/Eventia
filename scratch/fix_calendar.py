import glob
import os

def fix_calendar():
    # Encontrar el archivo usando glob para evitar problemas de ruta absoluta con caracteres especiales
    paths = glob.glob('**/ProviderDetailClient.tsx', recursive=True)
    target_paths = [p for p in paths if 'cliente' in p and 'proveedor' in p]
    
    if not target_paths:
        print("No se encontró el archivo ProviderDetailClient.tsx")
        return
    
    path = target_paths[0]
    print(f"Procesando: {path}")
    
    with open(path, 'rb') as f:
        content = f.read()
    
    # Inyectar props controladas
    target_culture = b'culture="es"'
    if target_culture in content and b'date={calendarDate}' not in content:
        replacement_culture = b'culture="es"\n                           date={calendarDate}\n                           view={calendarView}\n                           onNavigate={(date) => setCalendarDate(date)}\n                           onView={(view) => setCalendarView(view)}'
        content = content.replace(target_culture, replacement_culture)
        print("Props de cultura inyectadas.")
    
    # Inyectar traducción de Agenda
    target_day = b'day: "D\xed' # Usando el byte 0xed para 'í'
    if target_day in content and b'agenda: "Agenda"' not in content:
        replacement_day = b'agenda: "Agenda",\n                             day: "D\xed'
        content = content.replace(target_day, replacement_day)
        print("Traducción de Agenda agregada.")
    else:
        # Reintento con UTF-8 por si acaso
        target_day_utf8 = b'day: "D\xc3\xad'
        if target_day_utf8 in content and b'agenda: "Agenda"' not in content:
            replacement_day_utf8 = b'agenda: "Agenda",\n                             day: "D\xc3\xad'
            content = content.replace(target_day_utf8, replacement_day_utf8)
            print("Traducción de Agenda agregada (UTF-8).")

    with open(path, 'wb') as f:
        f.write(content)
    print("Archivo guardado con éxito.")

if __name__ == "__main__":
    fix_calendar()
