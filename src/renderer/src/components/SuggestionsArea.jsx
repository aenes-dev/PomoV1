import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lightbulb,
  Send,
  Loader2,
  MessageCircle,
  CornerDownRight,
  Trash2,
  Reply,
  SmilePlus,
  ShieldCheck
} from 'lucide-react'
import toast from 'react-hot-toast'
import useAppStore from '../store/useAppStore'
import useSuggestionStore from '../store/useSuggestionStore'

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '💡', '🚀', '😂', '👀', '💯', '✨', '👏', '🎉', '🧠']

const SuggestionsArea = () => {
  const { user } = useAppStore()
  const {
    suggestions,
    isLoading,
    fetchSuggestions,
    createSuggestion,
    toggleReaction,
    addReply,
    deleteContent
  } = useSuggestionStore()

  const [localIsSubmitting, setLocalIsSubmitting] = useState(false)
  const [suggestionText, setSuggestionText] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [replyTexts, setReplyTexts] = useState({})
  const [activeReactionPicker, setActiveReactionPicker] = useState(null)

  const currentUserId = user?._id || user?.id || 'me'

  const toastOptions = {
    style: {
      background: '#18181b',
      color: '#fff',
      border: '1px solid #10b981',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
    }
  }

  useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  // DÜZELTME 1: Görünmez overlay yerine profesyonel dışarı tıklama dinleyicisi
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveReactionPicker(null)
    }

    if (activeReactionPicker) {
      // Menü açılırken anında kapanmasını önlemek için ufak bir gecikme
      setTimeout(() => {
        window.addEventListener('click', handleOutsideClick)
      }, 0)
    }

    return () => {
      window.removeEventListener('click', handleOutsideClick)
    }
  }, [activeReactionPicker])

  const handleToggleReaction = async (e, suggestionId, emoji) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    setActiveReactionPicker(null)
    await toggleReaction(suggestionId, emoji)
  }

  const handleDeleteSuggestion = async (id) => {
    const success = await deleteContent(id)
    if (success) toast('Önerin silindi.', { icon: '🗑️', ...toastOptions })
  }

  const handleDeleteReply = async (suggestionId, replyId) => {
    const success = await deleteContent(suggestionId, replyId)
    if (success) toast('Yanıtın silindi.', { icon: '🗑️', ...toastOptions })
  }

  const handleTagUser = (suggestionId, targetUsername) => {
    const currentText = replyTexts[suggestionId] || ''
    setReplyTexts({ ...replyTexts, [suggestionId]: `${currentText}@${targetUsername} ` })
    setTimeout(() => {
      const inputEl = document.getElementById(`reply-input-${suggestionId}`)
      if (inputEl) inputEl.focus()
    }, 50)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!suggestionText.trim()) return

    setLocalIsSubmitting(true)
    const success = await createSuggestion(suggestionText)
    if (success) {
      setSuggestionText('')
      toast('Önerin toplulukla paylaşıldı!', { icon: '💡', ...toastOptions })
    }
    setLocalIsSubmitting(false)
  }

  const handleReplySubmit = async (e, suggestionId) => {
    e.preventDefault()
    const text = replyTexts[suggestionId]
    if (!text?.trim()) return

    const success = await addReply(suggestionId, text)
    if (success) {
      setReplyTexts({ ...replyTexts, [suggestionId]: '' })
      toast('Yanıtın eklendi!', { icon: '💬', ...toastOptions })
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('tr-TR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // DÜZELTME 2: Emoji menüsünde tıklamaların boşa gitmesini önleyen yapı
  const EmojiMenu = ({ onSelect }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="absolute right-0 bottom-full mb-2 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-2xl p-3 shadow-xl z-50 grid grid-cols-4 gap-2 w-48"
      onClick={(e) => e.stopPropagation()} // Menü içi tıklamaların dışarı kaçmasını engeller
    >
      {QUICK_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={(e) => {
            e.stopPropagation() // Tıklamanın sadece emojide kalmasını sağlar
            onSelect(e, emoji)
          }}
          className="text-xl hover:bg-gray-100 dark:hover:bg-[#27272a] rounded-lg p-1.5 transition-colors"
        >
          {emoji}
        </button>
      ))}
    </motion.div>
  )

  if (isLoading && suggestions.length === 0) {
    return (
      <div className="flex-1 w-full h-full bg-gray-50 dark:bg-[#09090b] flex items-center justify-center relative overflow-hidden">
        <div className="absolute w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="z-10 flex flex-col items-center"
        >
          <div className="relative flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="absolute w-20 h-20 rounded-full border-[3px] border-transparent border-t-emerald-500 border-r-emerald-400"
            />
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-14 h-14 bg-white dark:bg-[#18181b] rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 z-10"
            >
              <Lightbulb size={26} className="text-emerald-500" />
            </motion.div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-wide mb-1">
            PomoV1
          </h2>
          <p className="text-xs text-emerald-500 font-bold tracking-widest uppercase animate-pulse">
            Fikirler Yükleniyor...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full h-full bg-gray-50 dark:bg-[#09090b] flex flex-col relative overflow-hidden transition-colors duration-500">
      {/* İğrenç fixed overlay KALDIRILDI! Z-Index bug'ı bitti. */}

      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="pt-8 pb-6 px-10 border-b border-gray-200/50 dark:border-[#27272a]/50 z-10 bg-white/50 dark:bg-[#09090b]/50 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <Lightbulb size={24} />
              </span>
              Topluluk Önerileri
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium ml-1">
              Uygulamada neleri görmek istersin? Fikirlerini paylaş, tartış ve emojilerle tepki ver!
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-10 py-8 z-10 custom-scrollbar">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-3xl p-2 shadow-sm flex items-end gap-3 focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all relative z-20"
          >
            <div className="flex-1 pl-4 pt-2">
              <textarea
                value={suggestionText}
                onChange={(e) => setSuggestionText(e.target.value)}
                placeholder="Yeni bir fikrin mi var? Buraya yaz..."
                className="w-full bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none resize-none h-12 py-2 custom-scrollbar"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={!suggestionText.trim() || localIsSubmitting}
              className="m-2 p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-40 flex-shrink-0"
            >
              {localIsSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} className="ml-0.5" />
              )}
            </button>
          </motion.form>

          {suggestions.length === 0 ? (
            <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-3">
              <MessageCircle size={32} className="text-gray-300 dark:text-[#27272a]" />
              <p>Henüz bir öneri yok. İlk kıvılcımı sen çak!</p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 gap-5 w-full relative z-10">
              {suggestions
                .sort((a, b) => {
                  const aAdmin = a.user?.role === 'admin' ? 1 : 0
                  const bAdmin = b.user?.role === 'admin' ? 1 : 0
                  return bAdmin - aAdmin
                })
                .map((suggestion, index) => {
                  const suggestionUserId =
                    suggestion.user?._id || suggestion.user?.id || suggestion.user
                  const isOwner = suggestionUserId === currentUserId
                  const suggestionUsername = suggestion.user?.username || 'Kullanıcı'
                  const isAdmin = suggestion.user?.role === 'admin'
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      key={suggestion._id}
                      onClick={() =>
                        setExpandedId(expandedId === suggestion._id ? null : suggestion._id)
                      }
                      className="break-inside-avoid mb-5 inline-block w-full bg-white dark:bg-[#18181b]/60 border border-gray-200 dark:border-[#27272a] rounded-3xl p-6 hover:border-emerald-500/30 transition-all flex flex-col relative group cursor-pointer"
                    >
                      <div className="flex-1 pointer-events-none">
                        <div className="flex items-center justify-between mb-4 pointer-events-auto">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                            {suggestion.user?.avatar || suggestion.user?.profilePicture ? (
                              <img
                                src={suggestion.user.avatar || suggestion.user.profilePicture}
                                alt="avatar"
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center uppercase">
                                {suggestionUsername.charAt(0)}
                              </div>
                            )}
                            {suggestionUsername}
                            {isAdmin && (
                              <span className="ml-1 flex items-center gap-1 text-[10px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                <ShieldCheck size={10} /> Dev
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-medium text-gray-400">
                              {formatDate(suggestion.createdAt)}
                            </span>

                            {isOwner && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteSuggestion(suggestion._id)
                                }}
                                className="p-1.5 bg-red-500/10 text-red-500 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                                title="Öneriyi Sil"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pointer-events-auto">
                          {suggestion.content}
                        </p>
                      </div>

                      <div className="mt-6 flex justify-between items-center pointer-events-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedId(expandedId === suggestion._id ? null : suggestion._id)
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            expandedId === suggestion._id
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : suggestion.replies?.length > 0
                                ? 'text-gray-500 bg-gray-100 dark:bg-[#27272a] hover:bg-emerald-500/10 hover:text-emerald-500'
                                : 'opacity-0 group-hover:opacity-100 text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-500'
                          }`}
                        >
                          <MessageCircle size={14} />
                          {suggestion.replies?.length > 0
                            ? `${suggestion.replies.length} Yanıt`
                            : 'Yanıtla'}
                        </button>

                        <div className="flex flex-wrap items-center gap-2 justify-end relative">
                          {suggestion.reactions?.map((reaction) => (
                            <button
                              key={reaction.emoji}
                              onClick={(e) =>
                                handleToggleReaction(e, suggestion._id, reaction.emoji)
                              }
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                                reaction.reacted
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                                  : 'bg-gray-50 dark:bg-[#09090b] text-gray-500 border-gray-200 dark:border-[#27272a] hover:border-emerald-500/50 hover:text-emerald-500'
                              }`}
                            >
                              <span>{reaction.emoji}</span>
                              <span>{reaction.count}</span>
                            </button>
                          ))}

                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveReactionPicker(
                                  activeReactionPicker === suggestion._id ? null : suggestion._id
                                )
                              }}
                              className="p-1.5 rounded-lg text-gray-400 bg-gray-50 dark:bg-[#09090b] border border-gray-200 dark:border-[#27272a] hover:border-emerald-500/50 hover:text-emerald-500 transition-all"
                              title="Tepki Ekle"
                            >
                              <SmilePlus size={14} />
                            </button>

                            <AnimatePresence>
                              {activeReactionPicker === suggestion._id && (
                                <EmojiMenu
                                  onSelect={(e, emoji) =>
                                    handleToggleReaction(e, suggestion._id, emoji)
                                  }
                                />
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedId === suggestion._id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="border-t border-gray-100 dark:border-[#27272a] mt-4 pt-4">
                              {suggestion.replies?.length > 0 && (
                                <div className="flex flex-col gap-3 mb-4 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                  {suggestion.replies.map((reply) => {
                                    const replyUserId =
                                      reply.user?._id || reply.user?.id || reply.user
                                    const isReplyOwner = replyUserId === currentUserId
                                    const replyUsername = reply.user?.username || 'Kullanıcı'

                                    return (
                                      <div
                                        key={reply._id}
                                        className="flex gap-2.5 group/reply relative"
                                      >
                                        {reply.user?.avatar || reply.user?.profilePicture ? (
                                          <img
                                            src={reply.user.avatar || reply.user.profilePicture}
                                            alt="avatar"
                                            className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5"
                                          />
                                        ) : (
                                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center uppercase text-[10px] font-bold flex-shrink-0 mt-0.5">
                                            {replyUsername.charAt(0)}
                                          </div>
                                        )}

                                        <div className="flex-1 bg-gray-50 dark:bg-[#09090b] rounded-2xl rounded-tl-none p-3 border border-gray-100 dark:border-[#27272a]">
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                              {replyUsername}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                              {formatDate(reply.createdAt)}
                                            </span>
                                          </div>
                                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                                            {reply.content}
                                          </p>
                                        </div>

                                        <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover/reply:opacity-100 transition-opacity bg-gray-50 dark:bg-[#09090b] rounded-lg shadow-sm border border-gray-200 dark:border-[#27272a] p-0.5">
                                          <button
                                            onClick={() =>
                                              handleTagUser(suggestion._id, replyUsername)
                                            }
                                            className="p-1.5 text-gray-400 hover:text-emerald-500 rounded-md transition-colors"
                                            title="Yanıtla"
                                          >
                                            <Reply size={14} />
                                          </button>

                                          {isReplyOwner && (
                                            <button
                                              onClick={() =>
                                                handleDeleteReply(suggestion._id, reply._id)
                                              }
                                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                                              title="Sil"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}

                              <form
                                onSubmit={(e) => handleReplySubmit(e, suggestion._id)}
                                className="flex items-center gap-2 relative mt-2"
                              >
                                <CornerDownRight
                                  size={16}
                                  className="text-gray-300 dark:text-gray-600 absolute left-2"
                                />
                                <input
                                  id={`reply-input-${suggestion._id}`}
                                  type="text"
                                  value={replyTexts[suggestion._id] || ''}
                                  onChange={(e) =>
                                    setReplyTexts({
                                      ...replyTexts,
                                      [suggestion._id]: e.target.value
                                    })
                                  }
                                  placeholder="Fikre yanıt ver..."
                                  className="flex-1 bg-gray-50 dark:bg-[#09090b] border border-gray-200 dark:border-[#27272a] rounded-full pl-8 pr-10 py-2 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                />
                                <button
                                  type="submit"
                                  disabled={!replyTexts[suggestion._id]?.trim()}
                                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-500 text-white rounded-full disabled:opacity-50 hover:bg-emerald-600 transition-colors"
                                >
                                  <Send size={12} className="ml-0.5" />
                                </button>
                              </form>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SuggestionsArea
