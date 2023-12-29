"font & color settings
set encoding=utf-8
set guifont=Cascadia\ Code\ PL:h16
set t_Co=256
colo ron
hi Normal ctermfg=NONE ctermbg=NONE
hi EndOfBuffer ctermfg=NONE ctermbg=NONE

"gui settings
set guioptions-=m
set guioptions-=T
set guioptions-=r
set guioptions-=L

"general settings
set number
syntax on
set autoindent
set laststatus=2
set mouse=a

"tab settings
set tabstop=4
set shiftwidth=4
set invlist

"shortcut settings
set pastetoggle=<F10>
nnoremap <silent> <F4> :bnext<CR>
nnoremap <silent> <F3> :bprev<CR>
nnoremap <C-Left> :tabprevious<CR>
nnoremap <C-Right> :tabnext<CR>
nnoremap <silent> <A-Left> :execute 'silent! tabmove ' . (tabpagenr()-2)<CR>
nnoremap <silent> <A-Right> :execute 'silent! tabmove ' . (tabpagenr()+1)<CR>

"" MacOS-specific settings
if has("macunix")
	nnoremap <D-v> a<C-r>+<Esc>
	inoremap <D-v> <C-r>+
	cnoremap <D-v> <C-r>+
endif

"plugins settings
let g:airline_powerline_fonts = 1
let g:airline_theme="minimalist"
let g:airline#extensions#tabline#enabled = 1
let g:airline#extensions#tabline#left_sep = ' '
let g:airline#extensions#tabline#left_alt_sep = '|'

"vim-plug settings
call plug#begin()

Plug 'github/copilot.vim'

Plug 'godlygeek/tabular'

Plug 'vim-airline/vim-airline'

Plug 'vim-airline/vim-airline-themes'

Plug 'tpope/vim-fugitive'

Plug 'sbdchd/neoformat'

call plug#end()
