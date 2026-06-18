-- ==========================================
-- SCRIPT DE CRÉATION DE LA BASE DE DONNÉES
-- SaaS Ebrié Lagoon
-- ==========================================

-- 1. Table Utilisateurs (Staff & Pilotes)
CREATE TABLE IF NOT EXISTS public.utilisateurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom_complet TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Administrateur', 'Commercial', 'Pilote', 'Staff')),
    statut BOOLEAN DEFAULT TRUE, -- TRUE = Actif
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table Paramètres Société (Configuration Unique)
CREATE TABLE IF NOT EXISTS public.parametres_societe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raison_sociale TEXT NOT NULL DEFAULT 'Ebrié Lagoon',
    rccm TEXT,
    compte_contribuable TEXT,
    adresse TEXT,
    telephone TEXT,
    email TEXT,
    infos_bancaires TEXT,
    mentions_legales_pdf TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table Flotte (Navires)
CREATE TABLE IF NOT EXISTS public.flotte (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom_navire TEXT NOT NULL,
    type_navire TEXT NOT NULL, -- Catamaran, Speedboat, Yacht...
    capacite INT NOT NULL,
    moteur TEXT,
    statut TEXT NOT NULL DEFAULT 'Disponible' CHECK (statut IN ('Disponible', 'En Course', 'Maintenance')),
    raison_immobilisation TEXT,
    created_by_name TEXT,
    updated_by_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table Clients
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    prenom TEXT,
    type_client TEXT NOT NULL DEFAULT 'Particulier' CHECK (type_client IN ('Particulier', 'Entreprise')),
    email TEXT,
    telephone TEXT NOT NULL,
    origine_contact TEXT,
    adresse TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table Partenaires
CREATE TABLE IF NOT EXISTS public.partenaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom_entreprise TEXT NOT NULL,
    type_partenaire TEXT NOT NULL, -- Hôtellerie, Traiteur, Apporteur d'affaires
    contact TEXT,
    commission_pourcentage NUMERIC(5, 2) DEFAULT 0.00,
    statut TEXT NOT NULL DEFAULT 'Actif' CHECK (statut IN ('Actif', 'Inactif')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table Réservations
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_reference TEXT UNIQUE NOT NULL, -- ex: RES-2026-001
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    date_prestation DATE NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    statut TEXT NOT NULL DEFAULT 'En attente' CHECK (statut IN ('En attente', 'Confirmée', 'Annulée', 'Terminée')),
    type_prestation TEXT NOT NULL, -- Pack Mariage, Anniversaire...
    nb_personnes INT NOT NULL,
    navire_id UUID REFERENCES public.flotte(id) ON DELETE SET NULL,
    pilote_id UUID REFERENCES public.utilisateurs(id) ON DELETE SET NULL,
    options JSONB DEFAULT '{}'::JSONB, -- Ex: {"deco": true, "dj": false}
    montant_total NUMERIC(15, 2) DEFAULT 0.00,
    acompte NUMERIC(15, 2) DEFAULT 0.00,
    created_by_name TEXT,
    updated_by_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table Finances (Devis & Factures)
CREATE TABLE IF NOT EXISTS public.finances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_document TEXT UNIQUE NOT NULL, -- ex: FAC-001 ou DEV-042
    type_document TEXT NOT NULL CHECK (type_document IN ('Devis', 'Facture')),
    reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    date_creation DATE NOT NULL DEFAULT CURRENT_DATE,
    date_echeance DATE,
    statut TEXT NOT NULL DEFAULT 'En attente' CHECK (statut IN ('En attente', 'Brouillon', 'Acompte payé', 'Soldée', 'Annulé')),
    total_ht NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tva NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_ttc NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    acompte NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    reste_a_payer NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_by_name TEXT,
    updated_by_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Table Incidents & Réclamations
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_incident TEXT UNIQUE NOT NULL, -- ex: INC-0001
    date_heure TIMESTAMP WITH TIME ZONE NOT NULL,
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
    lieu_exact TEXT,
    nature TEXT NOT NULL,
    gravite TEXT NOT NULL CHECK (gravite IN ('Faible', 'Moyen', 'Critique')),
    secours_contactes TEXT,
    mesures_immediates TEXT,
    statut TEXT NOT NULL DEFAULT 'En traitement' CHECK (statut IN ('En traitement', 'Analyse interne', 'Clôturé')),
    type_declaration TEXT NOT NULL DEFAULT 'Incident' CHECK (type_declaration IN ('Incident', 'Réclamation')),
    created_by_name TEXT,
    updated_by_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- SÉCURITÉ : Row Level Security (RLS)
-- ==========================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parametres_societe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flotte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partenaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Exemples de politiques basiques (Tout ouvert pour le développement/prototypage)
-- À adapter lors du passage en production stricte.
CREATE POLICY "Activer toutes opérations pour les utilisateurs authentifiés" ON public.clients FOR ALL USING (true);
CREATE POLICY "Activer toutes opérations pour les utilisateurs authentifiés" ON public.flotte FOR ALL USING (true);
CREATE POLICY "Activer toutes opérations pour les utilisateurs authentifiés" ON public.reservations FOR ALL USING (true);
CREATE POLICY "Activer toutes opérations pour les utilisateurs authentifiés" ON public.finances FOR ALL USING (true);
CREATE POLICY "Activer toutes opérations pour les utilisateurs authentifiés" ON public.incidents FOR ALL USING (true);
CREATE POLICY "Activer toutes opérations pour les utilisateurs authentifiés" ON public.partenaires FOR ALL USING (true);
CREATE POLICY "Activer toutes opérations pour les utilisateurs authentifiés" ON public.utilisateurs FOR ALL USING (true);
CREATE POLICY "Activer toutes opérations pour les utilisateurs authentifiés" ON public.parametres_societe FOR ALL USING (true);
