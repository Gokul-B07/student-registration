import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = '/api/students'

const COMPANIES = [
  { name: 'Vibro', mark: 'V', color: 'violet', category: 'Engineering & technology' },
  { name: 'HCL', mark: 'H', color: 'blue', category: 'Technology' },
  { name: 'TCS', mark: 'T', color: 'sky', category: 'IT services' },
  { name: 'Infosys', mark: 'I', color: 'orange', category: 'Technology' },
  { name: 'Wipro', mark: 'W', color: 'purple', category: 'IT services' },
  { name: 'Accenture', mark: 'A', color: 'pink', category: 'Consulting' },
  { name: 'Cognizant', mark: 'C', color: 'green', category: 'Technology' },
  { name: 'Capgemini', mark: 'C', color: 'indigo', category: 'Consulting' },
  { name: 'Zoho', mark: 'Z', color: 'red', category: 'Software' },
  { name: 'Amazon', mark: 'a', color: 'yellow', category: 'E-commerce & technology' },
]

const EMPTY_FORM = {
  name: '',
  studentId: '',
  department: '',
  year: '',
  section: '',
  bloodGroup: '',
  fatherName: '',
  motherName: '',
  email: '',
  arrears: '',
}

function Icon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  if (name === 'grid') return <svg {...common}><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></svg>
  if (name === 'users') return <svg {...common}><path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" /><circle cx="9.5" cy="7" r="4" /><path d="M17 11a4 4 0 0 0 0-8M21 20v-1.5a4 4 0 0 0-3-3.87" /></svg>
  if (name === 'arrow') return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  if (name === 'check') return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>
  if (name === 'search') return <svg {...common}><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /></svg>
  if (name === 'download') return <svg {...common}><path d="M12 3v12m-5-5 5 5 5-5M4 20h16" /></svg>
  if (name === 'briefcase') return <svg {...common}><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18m-11 0v2h4v-2" /></svg>
  if (name === 'shield') return <svg {...common}><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></svg>
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
  return null
}

function App() {
  const [view, setView] = useState('student')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(EMPTY_FORM)
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState('All companies')

  useEffect(() => {
    if (view !== 'admin') return undefined

    const controller = new AbortController()

    async function loadStudents() {
      setStudentsLoading(true)
      setNotice('')
      try {
        const response = await fetch(API_URL, { signal: controller.signal })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Unable to load registrations.')
        if (!Array.isArray(result.students)) throw new Error('The server returned an invalid student list.')
        setStudents(result.students)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setNotice(`Could not load registrations: ${error instanceof Error ? error.message : 'Unknown error.'}`)
        }
      } finally {
        if (!controller.signal.aborted) setStudentsLoading(false)
      }
    }

    loadStudents()
    return () => controller.abort()
  }, [view])

  const eligibleCount = students.filter((student) => Number(student.arrears) === 0).length
  const uniqueCompanyCount = new Set(students.flatMap((student) => student.companies)).size

  const visibleStudents = useMemo(() => {
    const query = search.trim().toLowerCase()
    return students.filter((student) => {
      const matchesCompany = companyFilter === 'All companies' || student.companies.includes(companyFilter)
      const matchesSearch = !query || [student.name, student.studentId, student.department, student.email]
        .some((value) => value.toLowerCase().includes(query))
      return matchesCompany && matchesSearch
    })
  }, [students, search, companyFilter])

  function updateForm(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function submitStudentDetails(event) {
    event.preventDefault()
    if (Number(form.arrears) !== 0) {
      setNotice('Students with standing arrears are not eligible to register for placements.')
      return
    }
    setNotice('')
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function toggleCompany(companyName) {
    setSelectedCompanies((current) => current.includes(companyName)
      ? current.filter((company) => company !== companyName)
      : current.length < 4 ? [...current, companyName] : current)
  }

  async function registerStudent(event) {
    event.preventDefault()
    if (selectedCompanies.length !== 4) return
    const studentData = {
      ...form,
      arrears: Number(form.arrears),
      companies: selectedCompanies,
    }

    setSubmitting(true)
    setNotice('')
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Unable to submit registration.')
      if (!result.student) throw new Error('The server did not confirm the registration.')

      setStudents((current) => [result.student, ...current.filter((item) => item.studentId !== result.student.studentId)])
      setForm(EMPTY_FORM)
      setSelectedCompanies([])
      setStep(1)
      setNotice('Registration complete! Your company preferences have been saved.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setNotice(`Registration failed: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  function switchView(nextView) {
    setView(nextView)
    setNotice('')
  }

  function downloadCsv() {
    const headers = ['Student name', 'Student ID', 'Department', 'Year', 'Section', 'Blood group', 'Father name', 'Mother name', 'Email', 'Standing arrears', 'Selected companies']
    const rows = visibleStudents.map((student) => [
      student.name, student.studentId, student.department, student.year, student.section,
      student.bloodGroup, student.fatherName, student.motherName, student.email,
      student.arrears, student.companies.join('; '),
    ])
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'placement-registrations.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={() => switchView('student')}>
          <span className="brand-mark"><Icon name="briefcase" size={21} /></span>
          <span className="brand-copy"><strong>Pathway</strong><small>CAREER PORTAL</small></span>
        </a>

        <div className="nav-caption">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <button className={`nav-link ${view === 'student' ? 'active' : ''}`} onClick={() => switchView('student')}>
            <Icon name="grid" /><span>Student registration</span>
          </button>
          <button className={`nav-link ${view === 'admin' ? 'active' : ''}`} onClick={() => switchView('admin')}>
            <Icon name="users" /><span>Admin dashboard</span>
            {students.length > 0 && <span className="nav-count">{students.length}</span>}
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note-icon"><Icon name="shield" size={17} /></div>
          <p><strong>Your next chapter starts here.</strong><br />One registration. Four opportunities.</p>
          <span className="sidebar-year">PLACEMENT SEASON · 2025–26</span>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{view === 'student' ? 'Student registration' : 'Admin dashboard'}</strong></div>
          <div className="topbar-right"><span className="season-pill"><span className="season-dot" />Placement season open</span><span className="avatar">P</span></div>
        </header>

        {view === 'student' ? (
          <section className="page-content">
            <div className="page-heading">
              <div>
                <div className="eyebrow"><span className="eyebrow-line" /> YOUR CAREER JOURNEY</div>
                <h1>Let’s get you <span>placement ready.</span></h1>
                <p className="page-subtitle">Complete your profile and choose the companies you’d love to grow with.</p>
              </div>
              <div className="heading-decoration" aria-hidden="true"><span className="deco-orbit orbit-one" /><span className="deco-orbit orbit-two" /><span className="deco-star">✳</span></div>
            </div>

            {notice && <div className={`notice ${notice.startsWith('Registration complete') ? 'success' : 'warning'}`} role="status">{notice}</div>}

            <div className="registration-layout">
              <div className="registration-main">
                <div className="stepper">
                  <div className={`step-item ${step === 1 ? 'current' : 'complete'}`}><span className="step-number">{step > 1 ? <Icon name="check" size={15} /> : '01'}</span><span><strong>Your details</strong><small>Personal & academic info</small></span></div>
                  <span className={`step-connector ${step > 1 ? 'filled' : ''}`} />
                  <div className={`step-item ${step === 2 ? 'current' : ''}`}><span className="step-number">02</span><span><strong>Company choices</strong><small>Pick your top four</small></span></div>
                </div>

                {step === 1 ? (
                  <form className="form-card" onSubmit={submitStudentDetails}>
                    <div className="card-heading">
                      <div><span className="section-kicker">STEP 01 — YOUR PROFILE</span><h2>Tell us about yourself</h2><p>We’ll use these details to match you with the right opportunities.</p></div>
                      <span className="card-icon"><Icon name="users" size={20} /></span>
                    </div>
                    <div className="form-section">
                      <h3>Student information</h3>
                      <div className="form-grid">
                        <Field label="Student name" name="name" value={form.name} onChange={updateForm} placeholder="e.g. Ananya Kumar" required />
                        <Field label="Student ID" name="studentId" value={form.studentId} onChange={updateForm} placeholder="e.g. 21CSE104" required />
                        <Field label="Department" name="department" value={form.department} onChange={updateForm} placeholder="e.g. Computer Science" required />
                        <div className="field-row">
                          <SelectField label="Year of study" name="year" value={form.year} onChange={updateForm} options={['1st year', '2nd year', '3rd year', '4th year']} placeholder="Select year" required />
                          <Field label="Section" name="section" value={form.section} onChange={updateForm} placeholder="e.g. A" required />
                        </div>
                        <SelectField label="Blood group" name="bloodGroup" value={form.bloodGroup} onChange={updateForm} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} placeholder="Select group" required />
                      </div>
                    </div>
                    <div className="form-section family-section">
                      <h3>Family information</h3>
                      <div className="form-grid">
                        <Field label="Father’s name" name="fatherName" value={form.fatherName} onChange={updateForm} placeholder="Enter father’s full name" required />
                        <Field label="Mother’s name" name="motherName" value={form.motherName} onChange={updateForm} placeholder="Enter mother’s full name" required />
                        <Field label="Email address" name="email" type="email" value={form.email} onChange={updateForm} placeholder="you@college.edu" required />
                      </div>
                    </div>
                    <div className="eligibility-box">
                      <span className="eligibility-icon"><Icon name="shield" size={19} /></span>
                      <div><strong>Placement eligibility</strong><p>Students must have no standing arrears to continue.</p></div>
                      <label className="arrears-field"><span>Standing arrears</span><input name="arrears" type="number" min="0" max="99" step="1" value={form.arrears} onChange={updateForm} placeholder="0" required /></label>
                    </div>
                    <div className="form-footer"><span><span className="required-mark">*</span> All fields are required</span><button className="primary-button" type="submit">Continue to companies <Icon name="arrow" size={17} /></button></div>
                  </form>
                ) : (
                  <form className="form-card company-card" onSubmit={registerStudent}>
                    <div className="card-heading">
                      <div><span className="section-kicker">STEP 02 — YOUR PREFERENCES</span><h2>Choose your top four</h2><p>Pick exactly four companies to be considered for placement.</p></div>
                      <div className={`selection-counter ${selectedCompanies.length === 4 ? 'is-full' : ''}`}><strong>{selectedCompanies.length}</strong><span>of 4 picked</span></div>
                    </div>
                    <div className="company-grid">
                      {COMPANIES.map((company) => {
                        const selected = selectedCompanies.includes(company.name)
                        const disabled = !selected && selectedCompanies.length === 4
                        return <button key={company.name} className={`company-option ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`} type="button" aria-pressed={selected} disabled={disabled} onClick={() => toggleCompany(company.name)}>
                          <span className={`company-mark ${company.color}`}>{company.mark}</span>
                          <span className="company-copy"><strong>{company.name}</strong><small>{company.category}</small></span>
                          <span className="company-check">{selected && <Icon name="check" size={13} />}</span>
                        </button>
                      })}
                    </div>
                    <div className="preference-tip"><span className="tip-sparkle">✳</span><p><strong>Make it count.</strong> Choose the companies that best match your interests and career goals.</p></div>
                    <div className="form-footer"><button className="back-button" type="button" onClick={() => { setStep(1); setNotice('') }}>← Back to details</button><button className="primary-button" type="submit" disabled={selectedCompanies.length !== 4 || submitting}>{submitting ? 'Submitting…' : 'Submit registration'} <Icon name="arrow" size={17} /></button></div>
                  </form>
                )}
              </div>

              <aside className="journey-aside">
                <div className="aside-card journey-card">
                  <span className="aside-label">THE JOURNEY</span>
                  <div className="journey-art" aria-hidden="true"><span className="journey-sun" /><span className="journey-path path-back" /><span className="journey-path path-front" /><span className="journey-flag">✦</span></div>
                  <h3>Big things begin<br />with one step.</h3>
                  <p>Build your profile, tell us your preferences, and let opportunity find you.</p>
                  <div className="journey-points"><span><i className="point-dot purple-dot" />Your details stay yours</span><span><i className="point-dot green-dot" />Just 4 company choices</span><span><i className="point-dot orange-dot" />One exciting next step</span></div>
                </div>
                <div className="aside-card help-card"><span className="help-icon"><Icon name="clock" size={18} /></span><div><strong>Need a hand?</strong><p>Reach out to your placement coordinator for help.</p></div><span className="help-arrow">↗</span></div>
              </aside>
            </div>
          </section>
        ) : (
          <section className="page-content admin-page">
            {notice && <div className="notice warning" role="status">{notice}</div>}
            <div className="page-heading admin-heading">
              <div>
                <div className="eyebrow"><span className="eyebrow-line" /> PLACEMENT OFFICE</div>
                <h1>Good morning, <span>Admin.</span></h1>
                <p className="page-subtitle">A clear view of your students and their placement preferences.</p>
              </div>
              <button className="export-button" onClick={downloadCsv} disabled={visibleStudents.length === 0}><Icon name="download" size={16} /> Export list</button>
            </div>

            <div className="stats-grid">
              <StatCard label="Total registrations" value={students.length} foot="Student profiles submitted" icon="users" theme="lavender" />
              <StatCard label="Eligible students" value={eligibleCount} foot="Zero standing arrears" icon="shield" theme="mint" />
              <StatCard label="Companies selected" value={uniqueCompanyCount} foot={`Out of ${COMPANIES.length} listed companies`} icon="briefcase" theme="peach" />
              <StatCard label="Avg. preferences" value={students.length ? (students.reduce((total, student) => total + student.companies.length, 0) / students.length).toFixed(1) : '—'} foot="Choices per student" icon="grid" theme="bluewash" />
            </div>

            <div className="company-overview">
              <div className="panel-heading"><div><span className="section-kicker">PREFERENCE OVERVIEW</span><h2>Students by company</h2></div><span className="overview-caption">Select a company to filter the list</span></div>
              <div className="overview-grid">
                {COMPANIES.map((company) => {
                  const count = students.filter((student) => student.companies.includes(company.name)).length
                  const active = companyFilter === company.name
                  return <button key={company.name} className={`overview-item ${active ? 'active' : ''}`} onClick={() => setCompanyFilter(active ? 'All companies' : company.name)}>
                    <span className={`company-mark small-mark ${company.color}`}>{company.mark}</span>
                    <span className="overview-name">{company.name}</span><strong>{count}</strong>
                  </button>
                })}
              </div>
            </div>

            <div className="students-panel">
              <div className="panel-heading table-heading"><div><span className="section-kicker">STUDENT DIRECTORY</span><h2>{companyFilter === 'All companies' ? 'All registrations' : `${companyFilter} applicants`} <span className="result-count">{visibleStudents.length}</span></h2></div><div className="table-controls"><label className="search-box"><Icon name="search" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students..." aria-label="Search students" /></label><select value={companyFilter} onChange={(event) => setCompanyFilter(event.target.value)} aria-label="Filter by company"><option>All companies</option>{COMPANIES.map((company) => <option key={company.name}>{company.name}</option>)}</select></div></div>
              <div className="table-wrap">
                <table><thead><tr><th>STUDENT</th><th>DEPARTMENT</th><th>YEAR / SEC</th><th>EMAIL</th><th>ARREARS</th><th>COMPANY PREFERENCES</th></tr></thead>
                  <tbody>{visibleStudents.map((student) => <tr key={student.studentId}><td><div className="student-cell"><span className="student-avatar">{student.name.trim().charAt(0).toUpperCase()}</span><span><strong>{student.name}</strong><small>{student.studentId}</small></span></div></td><td>{student.department}</td><td>{student.year} · {student.section}</td><td>{student.email}</td><td><span className="arrears-badge">{student.arrears}</span></td><td><div className="preference-tags">{student.companies.map((company) => <span key={company}>{company}</span>)}</div></td></tr>)}</tbody>
                </table>
                {studentsLoading && <div className="empty-state"><strong>Loading registrations…</strong></div>}
                {!studentsLoading && visibleStudents.length === 0 && <div className="empty-state"><span className="empty-icon"><Icon name="users" size={22} /></span><strong>{students.length === 0 ? 'No registrations yet' : 'No students match your filters'}</strong><p>{students.length === 0 ? 'Student registrations will appear here as soon as they submit their preferences.' : 'Try another search or choose a different company filter.'}</p>{students.length > 0 && <button onClick={() => { setSearch(''); setCompanyFilter('All companies') }}>Clear filters</button>}</div>}
              </div>
              <div className="table-foot"><span>Showing <strong>{visibleStudents.length}</strong> of <strong>{students.length}</strong> students</span><span><span className="live-dot" /> Updates as students register</span></div>
            </div>
            <p className="prototype-note">Registrations are saved to the configured database. Add admin authentication before using the dashboard with real student information.</p>
          </section>
        )}
      </main>
    </div>
  )
}

function Field({ label, name, value, onChange, placeholder, type = 'text', required = false }) {
  return <label className="field"><span>{label}{required && <i className="required-mark"> *</i>}</span><input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} /></label>
}

function SelectField({ label, name, value, onChange, options, placeholder, required = false }) {
  return <label className="field"><span>{label}{required && <i className="required-mark"> *</i>}</span><select name={name} value={value} onChange={onChange} required={required}><option value="" disabled>{placeholder}</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}

function StatCard({ label, value, foot, icon, theme }) {
  return <div className="stat-card"><span className={`stat-icon ${theme}`}><Icon name={icon} size={19} /></span><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-foot">{foot}</span></div>
}

export default App
