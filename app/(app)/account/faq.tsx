import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../../src/theme';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: FAQItem[];
}

const FAQ_DATA: FAQSection[] = [
  {
    title: 'Commandes & Livraison',
    icon: 'cube-outline',
    items: [
      {
        question: 'Comment passer une commande ?',
        answer:
          'Créez votre souvenir en choisissant le type de produit, le format, le papier et le pelliculage. Ajoutez vos photos, personnalisez la mise en page, puis ajoutez le souvenir au panier pour finaliser votre commande.',
      },
      {
        question: 'Quels sont les délais de livraison ?',
        answer:
          'Les délais de livraison sont de 5 à 7 jours ouvrés après validation de votre commande. Pour la France métropolitaine, la livraison standard est gratuite au-dessus de 30€.',
      },
      {
        question: 'Puis-je suivre ma commande ?',
        answer:
          'Oui, une fois votre commande expédiée, vous recevrez un email avec un numéro de suivi. Vous pourrez également suivre l\'avancement dans la section "Historique des commandes" de votre compte.',
      },
      {
        question: 'Comment modifier ou annuler une commande ?',
        answer:
          'Vous pouvez modifier ou annuler votre commande tant qu\'elle n\'a pas été envoyée en production. Contactez notre support depuis la page "Nous contacter" avec votre numéro de commande.',
      },
    ],
  },
  {
    title: 'Produits & Personnalisation',
    icon: 'images-outline',
    items: [
      {
        question: 'Quels types de produits proposez-vous ?',
        answer:
          'Nous proposons des Albums et des Magazines photo. Chaque produit est disponible en plusieurs formats (A4 Portrait, A4 Paysage, Carré), types de reliure, de papier et de pelliculage.',
      },
      {
        question: 'Quelle est la qualité d\'image recommandée ?',
        answer:
          'Pour un résultat optimal, nous recommandons des photos d\'au moins 300 DPI (points par pouce). Les photos prises avec un smartphone récent sont généralement suffisantes.',
      },
      {
        question: 'Combien de photos puis-je ajouter ?',
        answer:
          'Chaque souvenir contient 24 pages par défaut. Selon la mise en page choisie, vous pouvez placer de 1 à 4 photos par page, soit jusqu\'à 96 photos par souvenir.',
      },
      {
        question: 'Quelle est la différence entre les pelliculages ?',
        answer:
          'Le Brillant offre des couleurs vives et un rendu éclatant. Le Mat donne un aspect plus sobre et élégant, sans reflets. Le Soft Touch ajoute une sensation veloutée au toucher, idéale pour un produit premium.',
      },
    ],
  },
  {
    title: 'Compte & Paiement',
    icon: 'wallet-outline',
    items: [
      {
        question: 'Comment créer un compte ?',
        answer:
          'Appuyez sur "S\'inscrire" depuis l\'écran de bienvenue. Renseignez votre prénom, nom, adresse email et choisissez un mot de passe. Votre compte sera créé instantanément.',
      },
      {
        question: 'Quels moyens de paiement acceptez-vous ?',
        answer:
          'Nous acceptons les cartes bancaires (Visa, Mastercard, CB), Apple Pay, Google Pay et PayPal. Tous les paiements sont sécurisés et chiffrés.',
      },
      {
        question: 'Mes données personnelles sont-elles protégées ?',
        answer:
          'Oui, vos données sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers. Nous respectons le RGPD et vous pouvez supprimer votre compte à tout moment.',
      },
    ],
  },
  {
    title: 'Problèmes & Support',
    icon: 'help-buoy-outline',
    items: [
      {
        question: 'Mon souvenir a un défaut, que faire ?',
        answer:
          'Contactez notre support avec une photo du défaut et votre numéro de commande. Nous remplacerons gratuitement votre souvenir ou vous rembourserons sous 7 jours.',
      },
      {
        question: 'J\'ai perdu mon brouillon, est-il récupérable ?',
        answer:
          'Vos brouillons sont automatiquement sauvegardés localement sur votre appareil. Si vous avez réinstallé l\'application, les brouillons non synchronisés ne sont malheureusement pas récupérables.',
      },
      {
        question: 'Comment contacter le support ?',
        answer:
          'Rendez-vous dans "Nous contacter" depuis la page Mon Compte. Vous pouvez nous envoyer un message directement depuis l\'application ou nous écrire à support@memoriz.app.',
      },
    ],
  },
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  return (
    <TouchableOpacity style={styles.faqItem} onPress={toggle} activeOpacity={0.7}>
      <View style={styles.faqQuestion}>
        <Text style={styles.faqQuestionText}>{item.question}</Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.textTertiary}
        />
      </View>
      {isOpen && (
        <Text style={styles.faqAnswer}>{item.answer}</Text>
      )}
    </TouchableOpacity>
  );
}

export default function FAQScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aide & FAQ</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Trouvez rapidement les réponses à vos questions les plus fréquentes.
        </Text>

        {FAQ_DATA.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={section.icon} size={20} color={Colors.accent} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <View style={styles.sectionCard}>
              {section.items.map((item, iIdx) => (
                <View key={iIdx}>
                  {iIdx > 0 && <View style={styles.divider} />}
                  <FAQAccordion item={item} />
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Contact CTA */}
        <View style={styles.contactCta}>
          <Text style={styles.contactCtaTitle}>Vous n'avez pas trouvé de réponse ?</Text>
          <TouchableOpacity
            style={styles.contactCtaBtn}
            onPress={() => router.push('/(app)/account/contact')}
          >
            <Ionicons name="chatbubble-outline" size={18} color={Colors.white} />
            <Text style={styles.contactCtaBtnText}>Nous contacter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },
  intro: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing['2xl'],
  },

  // Sections
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.lg,
  },

  // FAQ Item
  faqItem: {
    padding: Spacing.lg,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.md,
  },
  faqAnswer: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginTop: Spacing.md,
  },

  // Contact CTA
  contactCta: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing['2xl'],
  },
  contactCtaTitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  contactCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  contactCtaBtnText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '700',
  },
});
