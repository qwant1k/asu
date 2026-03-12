import { useState } from "react";

const NAV = [
  { id: "dashboard", icon: "⊞", label: "Обзор" },
  { id: "os", icon: "🖥", label: "Осн. средства" },
  { id: "nma", icon: "◈", label: "НМА" },
  { id: "tmz", icon: "📦", label: "ТМЗ" },
  { id: "requests", icon: "📋", label: "Заявки" },
  { id: "employees", icon: "👤", label: "Сотрудники" },
];

const OS_DATA = [
  { id: "ОС-00142", name: "Ноутбук Dell Latitude 5540", dept: "IT", responsible: "Сейткали А.Б.", inv: "ИНВ-2023-142", cost: "580 000", residual: "435 000", status: "В эксплуатации", assigned: "Жумабеков Д.Н.", date: "15.03.2023" },
  { id: "ОС-00098", name: "МФУ Kyocera ECOSYS M2735", dept: "Бухгалтерия", responsible: "Нурова М.С.", inv: "ИНВ-2022-098", cost: "320 000", residual: "192 000", status: "В эксплуатации", assigned: "Отдел бухгалтерии", date: "10.07.2022" },
  { id: "ОС-00201", name: "Кресло руководителя Falto", dept: "Администрация", responsible: "Сейткали А.Б.", inv: "ИНВ-2024-201", cost: "185 000", residual: "167 000", status: "В эксплуатации", assigned: "Байжанов К.Р.", date: "02.01.2024" },
  { id: "ОС-00077", name: "Проектор Epson EB-W51", dept: "Конференц-зал", responsible: "Нурова М.С.", inv: "ИНВ-2022-077", cost: "420 000", residual: "168 000", status: "На ремонте", assigned: "—", date: "20.03.2022" },
  { id: "ОС-00215", name: "Сервер Dell PowerEdge R350", dept: "IT", responsible: "Сейткали А.Б.", inv: "ИНВ-2024-215", cost: "2 450 000", residual: "2 327 500", status: "В эксплуатации", assigned: "Серверная", date: "11.02.2024" },
  { id: "ОС-00063", name: "Автомобиль Toyota Camry", dept: "АХО", responsible: "Ахметов Б.С.", inv: "ИНВ-2021-063", cost: "8 900 000", residual: "4 450 000", status: "В эксплуатации", assigned: "Искаков Р.А.", date: "01.06.2021" },
];

const NMA_DATA = [
  { id: "НМА-00012", name: "1С:Предприятие 8.3", type: "ПО", cost: "980 000", residual: "490 000", license: "до 31.12.2025", status: "Активна" },
  { id: "НМА-00018", name: "Microsoft Office 365 (25 лиц.)", type: "ПО", cost: "450 000", residual: "225 000", license: "до 15.08.2025", status: "Активна" },
  { id: "НМА-00024", name: "Антивирус Kaspersky Business", type: "ПО", cost: "120 000", residual: "40 000", license: "до 01.03.2025", status: "Истекает" },
  { id: "НМА-00031", name: "Товарный знак «Компания»", type: "Торг. знак", cost: "200 000", residual: "160 000", license: "до 2030", status: "Активна" },
  { id: "НМА-00039", name: "AutoCAD 2024 (5 лиц.)", type: "ПО", cost: "870 000", residual: "652 500", license: "до 20.11.2025", status: "Активна" },
];

const TMZ_DATA = [
  { id: "ТМЗ-4412", name: "Бумага A4 (пачка 500 л.)", unit: "уп.", qty: 214, min: 50, location: "Склад-1 / А-3", price: "2 100" },
  { id: "ТМЗ-4419", name: "Картридж HP CF226A", unit: "шт.", qty: 8, min: 10, location: "Склад-1 / Б-1", price: "18 500" },
  { id: "ТМЗ-4431", name: "Ручка шариковая (уп. 10)", unit: "уп.", qty: 43, min: 20, location: "Склад-1 / А-1", price: "850" },
  { id: "ТМЗ-4450", name: "Папка-регистратор 75мм", unit: "шт.", qty: 67, min: 30, location: "Склад-1 / А-2", price: "1 200" },
  { id: "ТМЗ-4465", name: "Маркер перм. Centropen", unit: "уп.", qty: 5, min: 15, location: "Склад-1 / А-1", price: "1 650" },
  { id: "ТМЗ-4478", name: "Степлер Rapid Supreme", unit: "шт.", qty: 12, min: 5, location: "Склад-2 / В-1", price: "3 900" },
];

const REQUESTS = [
  { id: "ЗАЯ-2025-0089", date: "10.03.2025", employee: "Жумабеков Д.Н.", dept: "Финансы", type: "ТМЗ", items: "Бумага A4 × 10 уп., Ручки × 2 уп.", status: "На согласовании", approver: "Нурова М.С." },
  { id: "ЗАЯ-2025-0088", date: "07.03.2025", employee: "Рахимова А.Т.", dept: "HR", type: "ОС", items: "Ноутбук Dell Latitude — 1 шт.", status: "Одобрена", approver: "Байжанов К.Р." },
  { id: "ЗАЯ-2025-0085", date: "04.03.2025", employee: "Сарсенов М.Н.", dept: "IT", type: "ТМЗ", items: "Картридж HP × 3 шт.", status: "Выдано", approver: "Нурова М.С." },
  { id: "ЗАЯ-2025-0081", date: "28.02.2025", employee: "Алтынбекова Ж.К.", dept: "Юридический", type: "НМА", items: "Доступ AutoCAD 2024 — 1 лиц.", status: "Выдано", approver: "Сейткали А.Б." },
  { id: "ЗАЯ-2025-0079", date: "25.02.2025", employee: "Берков П.И.", dept: "АХО", type: "ОС", items: "Кресло офисное — 2 шт.", status: "Отклонена", approver: "Байжанов К.Р." },
  { id: "ЗАЯ-2025-0074", date: "20.02.2025", employee: "Омарова Г.Б.", dept: "Бухгалтерия", type: "ТМЗ", items: "Папки-регистраторы × 20 шт.", status: "Выдано", approver: "Нурова М.С." },
];

const statusColors = {
  "В эксплуатации": { bg: "#EEF6EE", color: "#2E7D32" },
  "На ремонте":     { bg: "#FFF3E0", color: "#E65100" },
  "Списано":        { bg: "#FAFAFA", color: "#9E9E9E" },
  "Активна":        { bg: "#EEF6EE", color: "#2E7D32" },
  "Истекает":       { bg: "#FFF3E0", color: "#E65100" },
  "На согласовании":{ bg: "#E8F0FE", color: "#1A56CC" },
  "Одобрена":       { bg: "#E8F5E9", color: "#2E7D32" },
  "Выдано":         { bg: "#F3F3F3", color: "#616161" },
  "Отклонена":      { bg: "#FEECEC", color: "#C62828" },
};

function Badge({ status }) {
  const s = statusColors[status] || { bg: "#F5F5F5", color: "#555" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: 4,
      fontSize: 12, fontWeight: 500, whiteSpace: "nowrap",
    }}>{status}</span>
  );
}

function Th({ children, right }) {
  return (
    <th style={{
      padding: "10px 14px", textAlign: right ? "right" : "left",
      fontWeight: 500, fontSize: 12, color: "#8A93A2",
      borderBottom: "1px solid #EAECF0", whiteSpace: "nowrap",
      background: "#FAFBFC",
    }}>{children}</th>
  );
}

function Td({ children, right, muted, bold }) {
  return (
    <td style={{
      padding: "13px 14px", textAlign: right ? "right" : "left",
      fontSize: 13, color: muted ? "#9AA3B0" : bold ? "#101828" : "#344054",
      borderBottom: "1px solid #F2F4F7", whiteSpace: "nowrap",
    }}>{children}</td>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 10,
      border: "1px solid #EAECF0",
      padding: "20px 24px",
      display: "flex", flexDirection: "column", gap: 6,
    }}>
      <div style={{ fontSize: 13, color: "#667085" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || "#101828", lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#98A2B3" }}>{sub}</div>}
    </div>
  );
}

function Dashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "#101828", marginBottom: 4 }}>Обзор активов</h2>
        <p style={{ fontSize: 13, color: "#667085" }}>Сводка по всем категориям учёта на 12.03.2025</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        <StatCard label="Основные средства" value="138" sub="Балансовая стоимость: 127,4 млн ₸" />
        <StatCard label="НМА" value="21" sub="В т.ч. 3 истекают скоро" color="#C05C00" />
        <StatCard label="Позиции ТМЗ" value="84" sub="6 позиций ниже минимума" />
        <StatCard label="Заявки в обработке" value="12" sub="3 ожидают согласования" color="#1A56CC" />
      </div>

      {/* Recent requests */}
      <div style={{ background: "#fff", border: "1px solid #EAECF0", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #EAECF0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: "#101828" }}>Последние заявки</span>
          <span style={{ fontSize: 12, color: "#1A56CC", cursor: "pointer" }}>Все заявки →</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <Th>№ Заявки</Th><Th>Сотрудник</Th><Th>Тип</Th><Th>Дата</Th><Th>Статус</Th>
            </tr>
          </thead>
          <tbody>
            {REQUESTS.slice(0, 5).map(r => (
              <tr key={r.id} style={{ cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "#FAFBFC"} onMouseLeave={e => e.currentTarget.style.background = ""}>
                <Td><span style={{ color: "#1A56CC", fontWeight: 500 }}>{r.id}</span></Td>
                <Td>{r.employee} <span style={{ color: "#9AA3B0" }}>· {r.dept}</span></Td>
                <Td>{r.type}</Td>
                <Td muted>{r.date}</Td>
                <Td><Badge status={r.status} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#92400E", marginBottom: 10 }}>⚠ Требуют внимания</div>
          {[
            "Лицензия Kaspersky — истекает через 18 дней",
            "Картридж HP — остаток ниже минимума (8 шт.)",
            "Маркеры Centropen — остаток критический (5 шт.)",
          ].map((t, i) => <div key={i} style={{ fontSize: 12, color: "#78350F", padding: "5px 0", borderTop: i > 0 ? "1px solid #FDE68A" : "none" }}>• {t}</div>)}
        </div>
        <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#0C4A6E", marginBottom: 10 }}>ℹ Сведения</div>
          {[
            "Инвентаризация ОС — плановая: 01.04.2025",
            "Проектор ОС-00077 — на ремонте с 28.02.2025",
            "Новые заявки сегодня: 2 шт.",
          ].map((t, i) => <div key={i} style={{ fontSize: 12, color: "#0369A1", padding: "5px 0", borderTop: i > 0 ? "1px solid #BAE6FD" : "none" }}>• {t}</div>)}
        </div>
      </div>
    </div>
  );
}

function OSPage() {
  const [search, setSearch] = useState("");
  const filtered = OS_DATA.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.id.includes(search));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#101828", marginBottom: 2 }}>Основные средства</h2>
          <p style={{ fontSize: 13, color: "#667085" }}>{OS_DATA.length} объектов на учёте</p>
        </div>
        <button style={{ background: "#1A56CC", color: "#fff", border: "none", borderRadius: 6, padding: "9px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          + Добавить ОС
        </button>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по инвентарному номеру или наименованию..." style={{
          flex: 1, padding: "8px 14px", border: "1px solid #D0D5DD", borderRadius: 6, fontSize: 13, color: "#101828", outline: "none", fontFamily: "inherit",
        }} />
        <select style={{ padding: "8px 12px", border: "1px solid #D0D5DD", borderRadius: 6, fontSize: 13, color: "#667085", background: "#fff", cursor: "pointer" }}>
          <option>Все отделы</option><option>IT</option><option>Бухгалтерия</option><option>АХО</option>
        </select>
        <select style={{ padding: "8px 12px", border: "1px solid #D0D5DD", borderRadius: 6, fontSize: 13, color: "#667085", background: "#fff", cursor: "pointer" }}>
          <option>Все статусы</option><option>В эксплуатации</option><option>На ремонте</option><option>Списано</option>
        </select>
      </div>
      <div style={{ background: "#fff", border: "1px solid #EAECF0", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <Th>Инв. номер</Th><Th>Наименование</Th><Th>Отдел</Th><Th>Ответственный</Th>
              <Th right>Перв. стоимость, ₸</Th><Th right>Остат. стоимость, ₸</Th>
              <Th>Закреплено за</Th><Th>Статус</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} onMouseEnter={e => e.currentTarget.style.background = "#FAFBFC"} onMouseLeave={e => e.currentTarget.style.background = ""} style={{ cursor: "pointer" }}>
                <Td><span style={{ color: "#1A56CC", fontWeight: 500 }}>{r.id}</span><br /><span style={{ fontSize: 11, color: "#9AA3B0" }}>{r.inv}</span></Td>
                <Td bold>{r.name}</Td>
                <Td muted>{r.dept}</Td>
                <Td>{r.responsible}</Td>
                <Td right>{r.cost}</Td>
                <Td right bold>{r.residual}</Td>
                <Td>{r.assigned}</Td>
                <Td><Badge status={r.status} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NMAPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#101828", marginBottom: 2 }}>Нематериальные активы</h2>
          <p style={{ fontSize: 13, color: "#667085" }}>{NMA_DATA.length} объектов на учёте</p>
        </div>
        <button style={{ background: "#1A56CC", color: "#fff", border: "none", borderRadius: 6, padding: "9px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          + Добавить НМА
        </button>
      </div>
      <div style={{ background: "#fff", border: "1px solid #EAECF0", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <Th>Код</Th><Th>Наименование</Th><Th>Тип</Th>
              <Th right>Перв. стоимость, ₸</Th><Th right>Остат. стоимость, ₸</Th>
              <Th>Действие лицензии</Th><Th>Статус</Th>
            </tr>
          </thead>
          <tbody>
            {NMA_DATA.map(r => (
              <tr key={r.id} onMouseEnter={e => e.currentTarget.style.background = "#FAFBFC"} onMouseLeave={e => e.currentTarget.style.background = ""} style={{ cursor: "pointer" }}>
                <Td><span style={{ color: "#1A56CC", fontWeight: 500 }}>{r.id}</span></Td>
                <Td bold>{r.name}</Td>
                <Td muted>{r.type}</Td>
                <Td right>{r.cost}</Td>
                <Td right bold>{r.residual}</Td>
                <Td>{r.license}</Td>
                <Td><Badge status={r.status} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TMZPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#101828", marginBottom: 2 }}>Товарно-материальные запасы</h2>
          <p style={{ fontSize: 13, color: "#667085" }}>{TMZ_DATA.length} позиций в реестре</p>
        </div>
        <button style={{ background: "#1A56CC", color: "#fff", border: "none", borderRadius: 6, padding: "9px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          + Добавить позицию
        </button>
      </div>
      <div style={{ background: "#fff", border: "1px solid #EAECF0", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <Th>Код ТМЗ</Th><Th>Наименование</Th><Th>Ед.</Th>
              <Th right>Остаток</Th><Th right>Минимум</Th>
              <Th>Место хранения</Th><Th right>Цена, ₸</Th><Th>Уровень</Th>
            </tr>
          </thead>
          <tbody>
            {TMZ_DATA.map(r => {
              const pct = Math.round((r.qty / (r.min * 4)) * 100);
              const low = r.qty < r.min;
              return (
                <tr key={r.id} onMouseEnter={e => e.currentTarget.style.background = "#FAFBFC"} onMouseLeave={e => e.currentTarget.style.background = ""} style={{ cursor: "pointer" }}>
                  <Td><span style={{ color: "#1A56CC", fontWeight: 500 }}>{r.id}</span></Td>
                  <Td bold>{r.name}</Td>
                  <Td muted>{r.unit}</Td>
                  <Td right><span style={{ color: low ? "#C62828" : "#101828", fontWeight: 600 }}>{r.qty}</span></Td>
                  <Td right muted>{r.min}</Td>
                  <Td muted>{r.location}</Td>
                  <Td right>{r.price}</Td>
                  <Td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 70, height: 6, background: "#F2F4F7", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: low ? "#EF4444" : "#1A56CC", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, color: low ? "#C62828" : "#667085" }}>{low ? "Мало" : "Норма"}</span>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RequestsPage() {
  const [active, setActive] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#101828", marginBottom: 2 }}>Заявки на выдачу</h2>
          <p style={{ fontSize: 13, color: "#667085" }}>Управление заявками сотрудников на получение активов и ТМЗ</p>
        </div>
        <button style={{ background: "#1A56CC", color: "#fff", border: "none", borderRadius: 6, padding: "9px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          + Новая заявка
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6 }}>
        {["Все", "На согласовании", "Одобрена", "Выдано", "Отклонена"].map(f => (
          <button key={f} style={{
            padding: "6px 14px", border: "1px solid #D0D5DD", borderRadius: 6,
            fontSize: 12, background: f === "Все" ? "#1A56CC" : "#fff",
            color: f === "Все" ? "#fff" : "#667085", cursor: "pointer", fontFamily: "inherit",
          }}>{f}</button>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #EAECF0", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <Th>№ Заявки</Th><Th>Дата</Th><Th>Сотрудник</Th><Th>Тип</Th>
              <Th>Состав</Th><Th>Согласующий</Th><Th>Статус</Th><Th></Th>
            </tr>
          </thead>
          <tbody>
            {REQUESTS.map(r => (
              <tr key={r.id} onClick={() => setActive(r)} onMouseEnter={e => e.currentTarget.style.background = "#FAFBFC"} onMouseLeave={e => e.currentTarget.style.background = ""} style={{ cursor: "pointer" }}>
                <Td><span style={{ color: "#1A56CC", fontWeight: 500 }}>{r.id}</span></Td>
                <Td muted>{r.date}</Td>
                <Td bold>{r.employee}<br /><span style={{ fontSize: 11, color: "#9AA3B0", fontWeight: 400 }}>{r.dept}</span></Td>
                <Td><span style={{ fontSize: 12, background: "#F2F4F7", padding: "2px 8px", borderRadius: 4 }}>{r.type}</span></Td>
                <Td muted><span style={{ maxWidth: 220, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.items}</span></Td>
                <Td muted>{r.approver}</Td>
                <Td><Badge status={r.status} /></Td>
                <Td><span style={{ color: "#1A56CC", fontSize: 12 }}>Открыть →</span></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {active && (
        <div onClick={() => setActive(null)} style={{
          position: "fixed", inset: 0, background: "rgba(16,24,40,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 12, width: 520, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#101828" }}>{active.id}</div>
                <div style={{ fontSize: 12, color: "#667085", marginTop: 2 }}>Заявка от {active.date}</div>
              </div>
              <Badge status={active.status} />
            </div>
            {[
              ["Сотрудник", `${active.employee} (${active.dept})`],
              ["Тип актива", active.type],
              ["Состав заявки", active.items],
              ["Согласующий", active.approver],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #F2F4F7" }}>
                <span style={{ fontSize: 13, color: "#667085", width: 140, flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: 13, color: "#101828", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              {active.status === "На согласовании" && <>
                <button style={{ flex: 1, background: "#1A56CC", color: "#fff", border: "none", borderRadius: 6, padding: "10px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Одобрить</button>
                <button style={{ flex: 1, background: "#FEECEC", color: "#C62828", border: "none", borderRadius: 6, padding: "10px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Отклонить</button>
              </>}
              {active.status === "Одобрена" && <button style={{ flex: 1, background: "#2E7D32", color: "#fff", border: "none", borderRadius: 6, padding: "10px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Подтвердить выдачу</button>}
              <button onClick={() => setActive(null)} style={{ flex: 1, background: "#F2F4F7", color: "#344054", border: "none", borderRadius: 6, padding: "10px", fontSize: 13, cursor: "pointer" }}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PAGES = { dashboard: Dashboard, os: OSPage, nma: NMAPage, tmz: TMZPage, requests: RequestsPage };

export default function App() {
  const [page, setPage] = useState("dashboard");
  const Page = PAGES[page] || Dashboard;

  return (
    <div style={{
      display: "flex", height: "100vh", background: "#F7F8FA",
      fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
      color: "#101828",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D0D5DD; border-radius: 4px; }
        input, select, button { font-family: inherit; }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: 228, background: "#fff", borderRight: "1px solid #EAECF0",
        display: "flex", flexDirection: "column", flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #F2F4F7" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "#1A56CC", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>АУ</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#101828", lineHeight: 1.2 }}>Учёт активов</div>
              <div style={{ fontSize: 11, color: "#98A2B3" }}>Корпоративная система</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          <div style={{ fontSize: 11, color: "#98A2B3", padding: "8px 10px 6px", letterSpacing: "0.06em", fontWeight: 600, textTransform: "uppercase" }}>
            Разделы
          </div>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "9px 10px", borderRadius: 7, border: "none",
              background: page === n.id ? "#EEF4FF" : "transparent",
              color: page === n.id ? "#1A56CC" : "#667085",
              fontWeight: page === n.id ? 600 : 400,
              fontSize: 13, cursor: "pointer", textAlign: "left",
              transition: "all 0.12s",
              marginBottom: 2,
            }}
              onMouseEnter={e => { if (page !== n.id) e.currentTarget.style.background = "#F9FAFB"; }}
              onMouseLeave={e => { if (page !== n.id) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 15 }}>{n.icon}</span>
              {n.label}
              {n.id === "requests" && <span style={{ marginLeft: "auto", background: "#1A56CC", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>3</span>}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid #F2F4F7", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EEF4FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#1A56CC" }}>НМ</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#101828" }}>Нурова М.С.</div>
            <div style={{ fontSize: 11, color: "#98A2B3" }}>Бухгалтер</div>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 16, color: "#98A2B3", cursor: "pointer" }}>⚙</span>
        </div>
      </aside>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <header style={{
          height: 56, background: "#fff", borderBottom: "1px solid #EAECF0",
          display: "flex", alignItems: "center", padding: "0 28px", gap: 16, flexShrink: 0,
        }}>
          <div style={{ flex: 1, fontSize: 13, color: "#667085" }}>
            {NAV.find(n => n.id === page)?.label}
          </div>
          <div style={{ fontSize: 12, color: "#98A2B3" }}>12 марта 2025</div>
          <div style={{ width: 1, height: 20, background: "#EAECF0" }} />
          <button style={{ background: "#F2F4F7", border: "none", borderRadius: 6, padding: "7px 14px", fontSize: 12, color: "#344054", cursor: "pointer", fontFamily: "inherit" }}>
            🔔 Уведомления
          </button>
        </header>

        {/* Page */}
        <main style={{ flex: 1, overflow: "auto", padding: 28 }}>
          <Page />
        </main>
      </div>
    </div>
  );
}
